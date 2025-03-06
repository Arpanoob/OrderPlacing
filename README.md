# OrderPlacing

## PostMan collection :

https://www.postman.com/futureclo/workspace/xshipment/request/36444018-ce0d2706-807c-4fb1-96b7-cf1a54269c0e?action=share&creator=36444018&ctx=documentation

## API routes

### auth

            ```
          (post) /api/auth/register
                  body : {
                            "name":STRING,
                            "email":EMAIL,
                            "password":PASSWORD
                        }
          (post) /api/auth/login
                body : {
                            "email":EMAIL,
                            "password":PASSWORD
                       }
           (post) /api/auth/refresh
            ```

### order

            ```
           (post) /api/order
                 body :{
                        "userId": mongodb object id,
                        "totalAmount": total counts,
                        "items": [
                            {
                                "productId": string,
                                "quantity": number
                            }
                        ]
                    }
            (get) /api/order/:id =>id is uuid /orderid
            ```

## Step 1:

## Clone the repo

```
git clone git@github.com:Arpanoob/OrderPlacing.git
```

## Step 2:

## env.development / env.production

make .env.development file
or .env.production file
add these properties to them

```
PORT=
MONGO_URI=
JWT_PRIVATE_KEY=
REDIS_HOST=
REDIS_PORT=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SES_SENDER_EMAIL=
AWS_SQS_QUEUE_URL=
AWS_REGION=
AWS_SES_SENDER_EMAIL=
```

_for local mongodb url you need to add replica sets because transactions are used_

### Commands

for dev env (.env.development)

```
npm install
npm run dev
```

or
for dev env (.env.production)

```
npm install
npm run prod
```

or to serve build (need prod .env.production)

```
npm install
npm run build
npm run start
```

## Step 3:

### for seeding the inventoey

for env.development

```
npm run seed:inventory:dev
```

for env.production

```
npm run seed:inventory:prod
```

## Step 4:

### To run consumer(SQS worker and send SES mail)

for dev (.env.development)

```
npm run start:worker:dev
```

for prod (.env.development)

```
npm run start:worker:dev
```

#### With PM2

for prod DB

```
npm run start:worker:pm2:prod
```

for dev DB

```
npm run start:worker:pm2:dev
```

for deployment (used en .env.production)

```
npm run start:worker:deploy
```

to stop consumer/wprker pm2 window

```
stop:worker
``
to flush logs
```

pm2:flush:logs

```
### For logs tracing logs/app.log

```

tail -n 100 -f logs/app.log

```

System Architecture Overview

1. Client/User
   ○ Places an order via API
   ○ Receives confirmation email
2. Order Service (Express.js + MongoDB)
   ○ Handles order creation
   ○ Validates inventory
   ○ Pushes order to AWS SQS
3. Order Processor Worker (Node.js Service)
   ○ Listens to AWS SQS
   ○ Processes order & updates status
   ○ Stores order in Redis for quick retrieval
   ○ Sends AWS SES email notification
4. AWS Services
   ○ SQS: Manages async processing queue
   ○ SES: Sends email notifications
```
