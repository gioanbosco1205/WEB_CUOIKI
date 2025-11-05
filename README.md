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
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=ap-southeast-1_UWFaNnvCo
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=4pc1beegk96gun6gsmgq5qgpp3
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoidGhhbmhkdW9uZzEiLCJhIjoiY21ncXFsNmxkMWo0eTJucTVlb3BkazlrdCJ9.bIrgsF4gh8Lp0tlTdhv7gw


env/server
PORT = 3001
DATABASE_URL = "postgresql://postgres:1234567890aA@localhost:5432/realestate2?schema=public"


