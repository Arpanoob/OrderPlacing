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
