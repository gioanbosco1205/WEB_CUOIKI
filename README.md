# Minhkhanh_web
npm install @fortawesome/free-brands-svg-icons --save
npm install

Cd client 
npm install
npm install @fortawesome/react-fontawesome @fortawesome/free-brands-svg-icons @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core

npm install express
npm install -D @types/express

// server 
npm init -y

hello
// prisma 
CREATE EXTENSION IF NOT EXISTS postgis;
npm install ts-node typescript --save-dev
npm install prisma --save-dev
npm run prisma:generate
npx prisma migrate dev --name init
npm run seed
npm install --save-dev kill-port

2
npm install prisma ts-node typescript --save-dev
npx prisma generate
npx prisma migrate reset
npx prisma migrate dev --name init
npm run seed


npx prisma studio
env/client
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=ap-southeast-1_UWFaNnvCo
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=4pc1beegk96gun6gsmgq5qgpp3
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZHVjcGhhbTk3ODYiLCJhIjoiY21nbG5tZHZ2MThlNDJrcHI1OWQ2YWoweSJ9.7Q8pPl5n0O3S2d0H8hrtBw


env/server
PORT = 3001
DATABASE_URL = "postgresql://postgres:1234567890aA@localhost:5432/realestate2?schema=public"


  // {
  //   "id": 1,
  //   "country": "Việt Nam",
  //   "city": "Thủ Dầu Một",
  //   "state": "Bình Dương",
  //   "address": "340/23/8, 340/35 Đ. Phú Lợi, Phú Hoà, Thủ Dầu Một, Bình Dương, Việt Nam",
  //   "postalCode": "72000",
  //   "coordinates": "POINT(10.982885446306781 106.678380466954)"
  // },