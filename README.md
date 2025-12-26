# Minhkhanh_web
npm install @fortawesome/free-brands-svg-icons --save
npm install

Cd client 
npm install
npm install @fortawesome/react-fontawesome @fortawesome/free-brands-svg-icons @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core

npm install express
npm install -D @types/express

// server 
npm install rimraf --save-dev

npm init -y

// prisma 
npm run prisma:generate 
npx prisma migrate reset
npx prisma migrate dev --name init

npm run seed
npx prisma studio

npm install --save-dev kill-port



env/client


env/server
PORT = 3001
DATABASE_URL = "postgresql://postgres:1234567890aA@localhost:5432/realestate2?schema=public"


useState lưu trữ và cập nhật dữ liệu tạm 
