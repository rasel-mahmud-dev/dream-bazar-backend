# Dream Bazar Backend


Dream Bazar is Multi-Product and Vendor Ecommerce website, build with Nodejs,
React js and Mongodb

Live: https://dream-bazar.netlify.app


## Functional requirement.
- Social Google Authentication
- Local Authentication.
    - Hash password
    - Email verification
    - Forgot password.
    - block user

- Customer Dashboard
    - My Order
    - My wishlist
    - My transaction
    - Profile
    - Shipping Address

- Seller Dashboard
  - Add product 
  - Order List
  - Sales

- Admin Dashboard
  - All Customer List
  - All Seller List
  - Add product
  - Order List
  - Sales

## Database requirement.
- Mongodb


## Functional analysis.
## Models

**User**
- _id: ObjectId
- googleId: string
- facebookId: string
- username: string
- firstName: string
- lastName: string
- email: string,
- password: string
- createdAt: Date
- updatedAt: Date
- roles: Roles[]
- avatar: string
- accountStatus: boolean


**Products**
- _id: ObjectId | string
- title: string
- slug: string
- price: number
- discount: number
- attributes: object
- coverPhoto: string
- qty: number
- sold: number
- views: number
- brandId: string | ObjectId
- categoryId: string | ObjectId
- sellerId: ObjectId | string
- createdAt: Date
- updatedAt: Date
- isApproved: boolean
- isActive: boolean
- sku: number
- productType: "Digital" | "Physical"
- isMall: boolean



### Endpoint
...
