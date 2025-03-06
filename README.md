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

```
git clone git@github.com:Arpanoob/OrderPlacing.git
npm install
npm run dev
```

or

```
git clone git@github.com:Arpanoob/OrderPlacing.git
npm install
npm run prod
```

or (need prod .env.production)

```
git clone git@github.com:Arpanoob/OrderPlacing.git
npm install
npm run build
npm run start
```

### for seeding the inventoey

for env.development

```
npm run seed:inventory:dev
```

for env.production

```
npm run seed:inventory:prod
```

### To run consumer(SQS worker)

```
npm run start:worker
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
