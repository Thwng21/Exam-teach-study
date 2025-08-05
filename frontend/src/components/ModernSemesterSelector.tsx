'use client'

import { useState, useEffect } from 'react'
import { Calendar, ChevronDown, Clock } from 'lucide-react'

interface ModernSemesterSelectorProps {
  selectedYear: string
  selectedSemester: string
  onYearChange: (year: string) => void
  onSemesterChange: (semester: string) => void
}

export default function ModernSemesterSelector({
  selectedYear,
  selectedSemester,
  onYearChange,
  onSemesterChange
}: ModernSemesterSelectorProps) {
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [isYearOpen, setIsYearOpen] = useState(false)
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)

  const semesters = [
    { value: 'HK1', label: 'Học kỳ 1', icon: '🍂', color: 'text-orange-600', bg: 'bg-orange-50' },
    { value: 'HK2', label: 'Học kỳ 2', icon: '❄️', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'HK_HE', label: 'Học kỳ hè', icon: '☀️', color: 'text-yellow-600', bg: 'bg-yellow-50' }
  ]

  useEffect(() => {
    generateAvailableYears()
  }, [])

  const generateAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    const years: string[] = []
    
    // Tạo danh sách năm học từ 3 năm trước đến 2 năm sau
    for (let i = -3; i <= 2; i++) {
      const year = currentYear + i
      years.push(`${year}-${year + 1}`)
    }
    
    setAvailableYears(years)
  }

  const getCurrentSemesterInfo = () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    
    // Logic xác định học kỳ hiện tại
    let currentSemester = 'HK1'
    let academicYear = `${year}-${year + 1}`
    
    if (month >= 8 && month <= 12) {
      currentSemester = 'HK1'
      academicYear = `${year}-${year + 1}`
    } else if (month >= 1 && month <= 5) {
      currentSemester = 'HK2'
      academicYear = `${year - 1}-${year}`
    } else {
      currentSemester = 'HK_HE'
      academicYear = `${year - 1}-${year}`
    }
    
    return { currentSemester, academicYear }
  }

  const getSemesterById = (id: string) => {
    return semesters.find(s => s.value === id) || semesters[0]
  }

  const isCurrentSemester = (year: string, semester: string) => {
    const { currentSemester, academicYear } = getCurrentSemesterInfo()
    return year === academicYear && semester === currentSemester
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Chọn năm học & học kỳ</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Year Selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Năm học
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsYearOpen(!isYearOpen)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">{selectedYear}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {isYearOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {availableYears.map(year => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      onYearChange(year)
                      setIsYearOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedYear === year ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{year}</span>
                      {getCurrentSemesterInfo().academicYear === year && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Hiện tại
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Semester Selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Học kỳ
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSemesterOpen(!isSemesterOpen)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{getSemesterById(selectedSemester).icon}</span>
                  <span className="text-gray-900 font-medium">
                    {getSemesterById(selectedSemester).label}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSemesterOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {isSemesterOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {semesters.map(semester => (
                  <button
                    key={semester.value}
                    type="button"
                    onClick={() => {
                      onSemesterChange(semester.value)
                      setIsSemesterOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedSemester === semester.value ? `${semester.bg} ${semester.color} font-medium` : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-3 text-lg">{semester.icon}</span>
                        <span>{semester.label}</span>
                      </div>
                      {isCurrentSemester(selectedYear, semester.value) && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Đang diễn ra
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Selection Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">
              Đang xem khóa học của:
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold text-gray-900 mr-2">
              {selectedYear}
            </span>
            <span className="text-sm text-gray-500 mr-2">•</span>
            <div className="flex items-center">
              <span className="mr-1 text-sm">{getSemesterById(selectedSemester).icon}</span>
              <span className="text-sm font-semibold text-gray-900">
                {getSemesterById(selectedSemester).label}
              </span>
            </div>
            {isCurrentSemester(selectedYear, selectedSemester) && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Học kỳ hiện tại
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
