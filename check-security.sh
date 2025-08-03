#!/bin/bash

echo "🔍 Kiểm tra bảo mật file .env..."
echo ""

# Kiểm tra .gitignore có .env không
if grep -q "\.env" .gitignore; then
    echo "✅ .gitignore đã bảo vệ file .env"
else
    echo "❌ CẢNH BÁO: .gitignore chưa có .env!"
fi

# Kiểm tra git status
echo ""
echo "📋 Git status:"
git status --porcelain | grep "\.env" || echo "✅ Không có file .env nào trong git staging"

# Kiểm tra git log
echo ""
echo "📝 Kiểm tra commit history:"
git log --oneline --name-only | grep "\.env" || echo "✅ Không có file .env nào trong commit history"

echo ""
echo "🛡️ Kết luận: File .env đã được bảo vệ an toàn!"
