# Nerkhin Server

- NOTE: All the following commands MUST be executed from the root of `server` project.

## Setup Environment Variables

First of all, create a new `.env` file in the root of your project and set up all your environment variables in it like
`.env.sample` file.

## Setup Postgres & PgAdmin Web Client

Run the following command to create and start the `postgres` and `pgAdmin4` containers:

```bash
make pg-up
```

Now, `pgAdmin4` web client is running in `localhost:5050`. Check it out and register the `postgres` server.

## Create database

After starting postgres container, run the following command to create your database:

```bash
make db-init
```

This command makes your `POSTGRES_DB` database.

## Create a migration

Now you can create your migration files by running the following command:

```bash
make mig-create f=[YOUR_MIG_FILE_NAME]
```

This command makes a migration file named `YOUR_MIG_FILE_NAME` in `scripts/db/migrations`.

## Migrate up and down

You can now apply migrations on your database by running the following commands:

```bash
make mig-up c=[COUNT]
```

The `mig-up` action migrates up your database. If `c` parameter is empty, it will migrate up until the last migration.

```bash
make mig-down c=[COUNT] a=[ALL]
```

The `mig-down` action migrates down your database. If `a` is set to `-all`, all migrations will be revert until the first one and if is set to empty, it will show a prompt to you to choose the proper option.

## Destroy and Stop Postgres and pgAdmin Web Client containers

By running the following command, `postgres` and `pgadmin` services will stop and be removed:

```bash
make pg-down
```

If you want to remove the volumes too, you can run the below command:

```bash
make pg-downv
```

## Download Go Dependencies

You should first download go modules to run the program. Run the following command:

```bash
go mod tidy
```

---

## New API Routes

- Base Route: `/api`
- Response Wrapper:

  ```json
  {
    success: boolean,
    message: string,
    data: any
  }
  ```

---

### City Service

- Base Route: `/city`

### Fetch All Cities

- Method: `GET`
- Route: `/fetch-all`
- Needs Authorization: `false`
- Request:

  - Body: `nil`

- Response:

  - Body:

  ```json
  [
    {
      id: number,
      name: string,
      type: CityType
    }
  ]

  enum CityType {
    NormalCity = 1
    ImportantCity = 2
    CountryCapital = 3
  }
  ```

### Create City

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      name: string, // required
      type: CityType // required
    }

    enum CityType {
      NormalCity = 1
      ImportantCity = 2
      CountryCapital = 3
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created city id
    }
    ```

### Update City

- Method: `PUT`
- Route: `/update`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      id: number, // required
      name: string, // required
      type: CityType // required
    }

    enum CityType {
      NormalCity = 1
      ImportantCity = 2
      CountryCapital = 3
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // updated city id
    }
    ```

### Fetch City By ID

- Method: `GET`
- Route: `/fetch/:id`
- Needs Authorization: `true`
- Request:

  - Body:
    - Query Parameters:
      - `id`: `number` (parent category id)

- Response:

  - Body:

    ```json
    {
      id: number // updated city id
    }
    ```

### Delete Cities

- Method: `POST`
- Route: `/batch-delete`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

  ```json
  {
    ids: number[] // required
  }
  ```

- Response:

  - Body: `nil`

---

### Auth Service

- Base Route: `/auth`

### Login

- Method: `POST`
- Route: `/login`
- Needs Authorization: `false`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      phone: string // required
    }
    ```

- Response:

  - Body:

    ```json
    {}
    ```

### Register User (Sign Up)

- Method: `POST`
- Route: `/register`
- Needs Authorization: `false`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      phone: string, // required
      cityId: number, // required
      role: UserRole, // required
      fullName: string, // required
    }

    enum UserRole {
      Wholesaler = 3
      Retailer = 4
    }
    ```

- Response:

  - Body:

    ```json
    {}
    ```

### Verify Code

- Method: `POST`
- Route: `/verify-code`
- Needs Authorization: `false`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      phone: string, // required
      code: string // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      token: string
    }
    ```

---

### Product Category Service

- Base Route: `/product-category`

### Create Product Category

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `form-data`
  - Body:

    ```json
    data: CategoryData (application/json) - stringified
    images: Image Files Appended to form data

    ----------------------

    type CategoryData {
      parentId: number // not required
      title: string // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created product category id
    }
    ```

### Fetch Main Product Categories

- Method: `GET`
- Route: `/fetch-main-categories`
- Needs Authorization: `true`
- Response:

  - Body:

    ```json
    [
      {
        id: number,
        parentId: number,
        title: string,
        imageUrl: string,
        subCategories: [
          {
            id: number,
            parentId: number,
            title: string,
            imageUrl: string,
          }
        ]
      }
    ]
    ```

### Fetch Product SubCategories

- Method: `GET`
- Route: `/fetch-sub-categories/:id`
- Needs Authorization: `true`
- Request:
  - Query Parameters:
    - `id`: `number` (parent category id)
- Response:

  - Body:

    ```json
    [
      {
        id: number,
        parentId: number,
        title: string,
        imageUrl: string
      }
    ]
    ```

### Fetch Product Categories By Filter

- Method: `POST`
- Route: `/fetch-categories`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      searchText: string // not required
    }
    ```

- Response:

  - Body:

    ```json
    [
      {
        id: number,
        parentId: number,
        title: string,
        imageUrl: string
      }
    ]
    ```

### Update Product Category

- Method: `PUT`
- Route: `/update`
- Needs Authorization: `true`
- Request:

  - Content-Type: `form-data`
  - Body:

    ```json
    data: ProductData (application/json)
    images: Image Files Appended to form data

    ----------------------
    type ProductData {
      id: number, // required
      parentId: number, // not required
      title: string, // not required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // updated product category id
    }
    ```

### Fetch Product Category By ID

- Method: `GET`
- Route: `/fetch/:id`
- Needs Authorization: `true`
- Request:
  - Query Parameters:
    - `id`: `number` (category id)
- Response:

  - Body:

    ```json
    [
      {
        id: number,
        parentId: number,
        title: string,
        imageUrl: string
      }
    ]
    ```

### Batch Delete Product Category

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      ids: number[] // required
    }
    ```

- Response:
  - Body: `null`

### Fetch Product SubCategories (for panel)

- Method: `GET`
- Route: `/fetch-sub-categories-panel/:id`
- Needs Authorization: `true`
- Request:
  - Query Parameters:
    - `id`: `number` (parent category id)
- Response:

  - Body:

    ```json
    {
      id: number,
      parentId: number,
      title: string,
      imageUrl: string,
      subCategories: [
        {
          id: number,
          parentId: number,
          title: string,
          imageUrl: string,
        }
      ]
    }

    ```

### Fetch Related Brand Models By Category ID

- Method: `GET`
- Route: `/fetch-brand-models/:categoryId`
- Needs Authorization: `true`
- Request:
  - Query Parameters:
    - `categoryId`: `number`
- Response:

  - Body:

    ```json
    [
      {
        brand: {
          id: number,
          title: string
        },
        models: [
          {
            id: number,
            title: string
          }
        ]
      }
    ]
    ```

---

### Product Brand Service

- Base Route: `/product-brand`

### Create Product Brand

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      categoryId: number // required
      title: string // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created product brand id
    }
    ```

### Fetch All Product Brands (For Panel)

- Method: `GET`
- Route: `/fetch-all/:categoryId`
- Needs Authorization: `true`
- Request:

  - Query Parameters:
    - `categoryId`: `number`

- Response:

  - Body:

    ```json
    {
      categoryTitle: string,
      subcategoryTitle: string,
      brands: [
        {
          id: number,
          title: string,
        }
      ]
    }
    ```

### Fetch Product Brands (For Bazaar)

- Method: `GET`
- Route: `/fetch-brands/:categoryId`
- Needs Authorization: `true`
- Request:
  - Query Parameters:
    - `categoryId`: `number`
- Response:

  - Body:

    ```json
    [
      {
        id: number,
        title: string
      }
    ]
    ```

### Update Product Brand

- Method: `PUT`
- Route: `/update`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      id: number, // required
      title: string, // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // updated product brand id
    }
    ```

### Delete Product Brand

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  - Body:

    ```json
    {
      ids: number[]
    }
    ```

- Response:
  - Body: `null`

### Fetch Product Brand By ID

- Method: `GET`
- Route: `/fetch/:id`
- Needs Authorization: `true`
- Request:

  - Body:
    - Query Parameters:
      - `id`: `number` (product brand id)

- Response:

  - Body:

    ```json
    {
      id: number,
      title: string
    }
    ```

---

### Product Model Service

- Base Route: `/product-model`

### Create Product Model

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      categoryId: number // required
      title: string // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created product model id
    }
    ```

### Fetch All Product Models (For Panel)

- Method: `GET`
- Route: `/fetch-all/:categoryId`
- Needs Authorization: `true`
- Request:

  - Query Parameters:
    - `categoryId`: `number`

- Response:

  - Body:

    ```json
    {
      categoryTitle: string,
      subcategoryTitle: string,
      models: [
        {
          id: number,
          title: string,
        }
      ]
    }
    ```

### Fetch Product Models (For Bazaar)

- Method: `GET`
- Route: `/fetch-models/:categoryId`
- Needs Authorization: `true`
- Request:
  - Query Parameters
    - `categoryId`: `number`
- Response:

  - Body:

    ```json
    [
      {
        id: number,
        title: string
      }
    ]
    ```

### Update Product Model

- Method: `PUT`
- Route: `/update`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      id: number, // required
      title: string, // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // updated product model id
    }
    ```

### Fetch Product Model By ID

- Method: `GET`
- Route: `/fetch/:id`
- Needs Authorization: `true`
- Request:

  - Body:
    - Query Parameters:
      - `id`: `number` (product model id)

- Response:

  - Body:

    ```json
    {
      id: number,
      title: string
    }
    ```

### Delete Product Model

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  - Body:

    ```json
    {
      ids: number[]
    }
    ```

- Response:
  - Body: `null`

---

### Product Filter Service

- Base Route: `/product-filter`

### Create Product Filter

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      categoryId: number // required
      name: string, // required
      displayName: string, // not required
      options: string[] // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created filter id
    }
    ```

### Fetch All Product Filters

- Method: `GET`
- Route: `/fetch-all/:categoryId`
- Needs Authorization: `true`
- Request:

  - Query Parameters:
    - `categoryId`: `number`

- Response:

  - Body:

    ```json
    {
      subcategoryTitle: string,
      categoryTitle: string,
      productFilters: [
        {
          filter: {
            id: number,
            name: string,
            displayName: string
          },
          options: [
            {
              id: number,
              filterId: number,
              name: string
            }
          ]
        }
      ]
    }
    ```

### Update Product Filter

- Method: `PUT`
- Route: `/update`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      id: number, // required
      name: string, // not required
      displayName: string, // not required
      options: string[] // not required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created filter id
    }
    ```

### Batch Delete Product Filter

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      ids: number[] // required
    }
    ```

- Response:
  - Body: `null`

### Batch Delete Product Filter Options

- Method: `POST`
- Route: `/delete-options`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      ids: number[] // required
    }
    ```

- Response:
  - Body: `null`

---

### Product Service

- Base Route: `/product`

### Create Product

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request

  - Content-Type: `form-data`
  - Body:

    ```json
    data: ProductData (application/json)
    images: Image Files Appended to form data

    ----------------------

    type ProductData {
      categoryId: number, // required
      subCategoryId: number, // conditionally required
      brandId: number, // required
      modelId: number, // required
      description: number, // not required
      defaultImageIndex: number, // required
      filterOptionIds: number[] // not required
      defaultOptionId: number, // not required
      tags: string[] // not required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number,
    }
    ```

### Update Product

- Method: `PUT`
- Route: `/update`
- Needs Authorization: `true`
- Request:

  - Content-Type: `form-data`
  - Body:

    ```json
    data: ProductData (application/json)
    images: Image Files Appended to form data

    ----------------------
    type ProductData {
      id: number, // required
      categoryId: number, // required
      subCategoryId: number, // required
      brandId: number, // required
      modelId: number, // required
      description: string, // not required
      imagesCount: number, // required
      defaultNewImageIndex: number, // required
      deletedImageIDs: number[], // not required
      newFilterOptionIDs: number[], // not required
      updatedFilterRelations: [
        {
          id: number, // required
          filterOptionId: number // required
        }
      ], // not required
      deletedFilterRelationIDs: number[], // not required
      defaultOptionId: number, // not required
      newTags: string[], // not required
      deletedTagIds: string[] // not required
    }
    ```

- Response:
  - Body: `{}`

### Fetch Products

- Method: `POST`
- Route: `/fetch-products`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      searchText: string // not required
      limit: number // not required - how many products to fetch
      categoryId: number // not required - to filter by category
      sortOrder: SortOrder // not required to sort by created_at field (default: None)
    }

    -----------------

    enum SortOrder {
      None = 1
      DESC = 2
      ASC = 3
    }
    ```

- Response:

  - Body:

    ```json
    [
      {
        id: number,
        categoryId: number,
        brandId: number,
        modelId: number,
        description: string,
        state: ProductState,
        categoryTitle: string,
        brandTitle: string,
        modelTitle: string,
        shopsCount: number,
        defaultImageUrl: string
        images: [
          {
            id: number,
            productId: number,
            url: string,
            isDefault: boolean
          }
        ],
        filterRelations: [
          {
            id: number,
            productId: number,
            filterId: number,
            filterOptionId: number,
            filterName: string,
            filterDisplayName: string,
            filterOptionName: string
          }
        ],
        tags: [
          {
            id: number,
            productId: number,
            tag: string,
          }
        ]
      }
    ]
    ```

### Fetch Product

- Method: `GET`
- Route: `/fetch/:id`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      id: number // required, product id.
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number,
      categoryId: number,
      brandId: number,
      modelId: number,
      description: string,
      state: ProductState,
      categoryTitle: string,
      brandTitle: string,
      modelTitle: string,
      shopsCount: number,
      defaultImageUrl: string
      images: [
        {
          id: number,
          productId: number,
          url: string,
          isDefault: boolean
        }
      ],
      filterRelations: [
        {
          id: number,
          productId: number,
          filterId: number,
          filterOptionId: number,
          filterName: string,
          filterDisplayName: string,
          filterOptionName: string
        }
      ],
      tags: [
        {
          id: number,
          productId: number,
          tag: string,
        }
      ]
    }
    ```

### Delete Product

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  - Body:

    ```json
    {
      ids: number[]
    }
    ```

- Response:
  - Body: `null`

---

### User Service

- Base Route: `/user`

### Update User

- Method: `PUT`
- Route: `/update`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      id: number, // required
      phone: string, // not required
      cityId: number // not required
      role: UserRole // not required
      fullName: string // not required
    }

    enum UserRole {
      Admin = 2
      Wholesaler = 3
      Retailer = 4
    }
    ```

- Response:

  - Body:

    ```json
    [
      {
        userId: number, // updated user id
      }
    ]
    ```

### Fetch User By ID

- Method: `GET`
- Route: `/fetch/:id`
- Needs Authorization: `true`
- Request:

  - Query Parameters:
    - `id`: `number` (user id)

- Response:

  - Body:

    ```json
    [
      {
        id: number,
        phone: string,
        cityId: number,
        role: number,
        state: number,
        fullName: string
      }
    ]
    ```

### Fetch Users

- Method: `POST`
- Route: `/fetch-users`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      role: UserRole // not required
      state: UserState // not required
      searchText: string // not required
      cityId: number // not required
    }

    enum UserRole {
      Admin = 2
      Wholesaler = 3
      Retailer = 4
    }

    enum UserState {
      NewUser = 1
      RejectedUser = 2
      InactiveAccount = 3
      InactiveShop = 4
      ApprovedUser = 5
    }
    ```

- Response:

  - Body:

    ```json
    [
      {
        id: number,
        phone: string,
        cityId: number,
        cityName: string,
        role: number,
        state: number,
        fullName: string,
        shopName: string,
        shopAddress: string,
        shopPhone1: string,
        shopPhone2: string,
        shopPhone3: string,
        instagramUrl: string,
        telegramUrl: string,
        websiteUrl: string,
        subscriptionDaysLeft: number
      }
    ]
    ```

### Update Shop

- Method: `PUT`
- Route: `/update-shop`
- Needs Authorization: `true`
- Request:

  - Content-Type: `form-data`
  - Body:

    ```json
    data: ShopData (json)
    images: images appended to form-data

    -------

    type ShopData {
      shopName: string, // not required
      shopPhone1: string, // not required
      shopPhone2: string, // not required
      shopPhone3: string, // not required
      shopAddress: string // not required
      telegramUrl: string, // not required
      instagramUrl: string, // not required
      whatsappUrl: string // not required
      websiteUrl: string, // not required
      latitude: string // not required
      longitude: string // not required
    }
    ```

- Response:
  - Body: `null`

### Delete

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  ```json
  {
    ids: number[] // not required
  }
  ```

- Response:
  - Body: `null`

### Add New User

- Method: `POST`
- Route: `/add-new-user`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      phone: string, // required
      cityId: number, // required
      role: UserRole, // required
      fullName: string, // required
    }

    enum UserRole {
      Wholesaler = 3
      Retailer = 4
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created user id
    }
    ```

### Add New Admin

- Method: `POST`
- Route: `/add-new-admin`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      phone: string, // required
      cityId: number, // required
      fullName: string, // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created admin id
    }
    ```

### Delete Admin

- Method: `POST`
- Route: `/delete-admin/:adminId`
- Needs Authorization: `true`
- Request:

  - Query Parameters:
    - `adminId`: `number` (admin id)

- Response:
  - Body: `null`

### Change State

- Method: `POST`
- Route: `/change-state`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      userId: number // required
      targetState: UserState // required
    }

    enum UserState {
      NewUser = 1
      RejectedUser = 2
      InactiveAccount = 3
      InactiveShop = 4
      ApprovedUser = 5
    }
    ```

- Response:
  - Body: `null`

### Fetch User Info

- Method: `GET`
- Route: `/fetch-user`
- Needs Authorization: `true`
- Response:

  - Body:

    ```json
    {
      id: number,
      phone: string,
      cityId: number,
      cityName: string,
      role: number,
      state: number,
      fullName: string,
      shopName: string,
      shopAddress: string,
      shopPhone1: string,
      shopPhone2: string,
      shopPhone3: string,
      instagramUrl: string,
      telegramUrl: string,
      websiteUrl: string,
      subscriptionDaysLeft: number,
      saveProduct: boolean,
      changeUserState: boolean,
      changeShopState: boolean,
      changeAccountState: boolean
    }
    ```

### Update Dollar price

- Method: `PUT`
- Route: `/update-dollar-price`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      dollarPrice: string // required
    }
    ```

- Response:
  - Body: `null`

### Get Admin Access Info

- Method: `GET`
- Route: `/get-admin-access/:adminId`
- Needs Authorization: `true`
- Request

  - Query Parameters:
    - `adminId`: `number` (admin id)

- Response:

  - Body:

  ```json
  {
    id: number,
    userId: number,
    saveProduct: boolean,
    changeUserState: boolean,
    changeShopState: boolean,
    changeAccountState: boolean
  }
  ```

### Update Admin Access Info

- Method: `POST`
- Route: `/update-admin-access/:adminId`
- Needs Authorization: `true`
- Request

  - Query Parameters:

    - `adminId`: `number` (admin id)

  - Body:

  ```json
  {
    saveProduct: boolean, // required
    changeUserState: boolean, // required
    changeShopState: boolean, // required
    changeAccountState: boolean, // required
  }
  ```

- Response:
  - Body: `null`

---

### Report Service

- Base Route: `/report`

### Create Report

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      targetUserId: number // required
      title: string // required
      description: string // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created report id
    }
    ```

### Fetch Report By ID

- Method: `GET`
- Route: `/fetch/:id`
- Needs Authorization: `true`
- Request:

  - Query Parameters:
    - `id`: `number` (report id)

- Response:

  - Body:

    ```json
    {
      id: number,
      title: string,
      description: string,
      userId: number,
      userFullName: string,
      userShopName: string,
      userPhone: string,
      userRole: UserRole,
      userCity: string,
      targetUserId: number,
      targetUserFullName: string,
      targetUserShopName: string,
      targetUserPhone: string,
      targetUserRole: UserRole,
      targetUserCity: string,
      state: ReportState,
      createdAt: DateTime,
      updatedAt: DateTime
    }

    -------

    enum UserRole {
      Wholesaler = 3
      Retailer = 4
    }

    enum ReportState {
      New = 1
      Checked = 2
    }
    ```

### Fetch Reports By Filter

- Method: `POST`
- Route: `/fetch-reports`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      state: ReportState // not required
      searchText: string // not required
    }

    enum ReportState {
      New = 1
      Checked = 2
    }
    ```

- Response:

  - Body:

    ```json
    [
      {
        id: number,
        title: string,
        description: string,
        userId: number,
        userFullName: string,
        userShopName: string,
        userPhone: string,
        userRole: UserRole,
        userCity: string,
        targetUserId: number,
        targetUserFullName: string,
        targetUserShopName: string,
        targetUserPhone: string,
        targetUserRole: UserRole,
        targetUserCity: string,
        state: ReportState,
        createdAt: DateTime,
        updatedAt: DateTime
      }
    ]

    -------

    enum UserRole {
      Wholesaler = 3
      Retailer = 4
    }

    enum ReportState {
      New = 1
      Checked = 2
    }
    ```

### Change Report State

- Method: `POST`
- Route: `/change-state`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      reportId: number, // required
      targetState: ReportState // required
    }

    enum ReportState {
      Checked = 2
    }
    ```

- Response:
  - Body: `null`

### Delete Report

- Method: `POST`
- Route: `/batch-delete`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

  ```json
  {
    ids: number[] // required
  }
  ```

- Response:

  - Body: `nil`

---

### Subscription Service

- Base Route: `/subscription`

### Create Subscription

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      price: string, // required
      numberOfDays: SubscriptionPeriod // required
    }

    enum SubscriptionPeriod {
      OneMonth = 1,
      ThreeMonths = 2,
      SixMonths = 3,
      OneYear = 4,
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created subscription id
    }
    ```

### Update Subscription

- Method: `PUT`
- Route: `/update`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      id: number, // required
      price: string, // required
    }

    enum SubscriptionPeriod {
      OneMonth = 1,
      ThreeMonths = 2,
      SixMonths = 3,
      OneYear = 4,
    }
    ```

- Response:
  - Body: `null`

### Fetch Subscription

- Method: `GET`
- Route: `/fetch/:id`
- Needs Authorization: `true`
- Request:

  - Query Parameters:
    - `id`: `number` (subscription id)

- Response:

  - Body:

    ```json
    {
      id: number,
      price: string,
      numberOfDays: SubscriptionPeriod,
      createdAt: DateTime,
      updatedAt: DateTime,
    }

    enum SubscriptionPeriod {
      OneMonth = 1,
      ThreeMonths = 2,
      SixMonths = 3,
      OneYear = 4,
    }
    ```

### Batch Delete Subscriptions

- Method: `POST`
- Route: `/batch-delete`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      ids: number[] // not required
    }
    ```

- Response:
  - Body: `null`

### Fetch All Subscriptions

- Method: `GET`
- Route: `/fetch-all`
- Needs Authorization: `true`
- Request: `nil`

- Response:

  - Body:

    ```json
    [
      {
        id: number,
        price: string,
        numberOfDays: SubscriptionPeriod,
        createdAt: DateTime,
        updatedAt: DateTime,
      }
    ]

    enum SubscriptionPeriod {
      OneMonth = 1,
      ThreeMonths = 2,
      SixMonths = 3,
      OneYear = 4,
    }
    ```

---

### User Product Service

- Base Route: `/user-product`

### Create User Product

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      categoryId: number, //required
      brandId: number, // required
      modelId: number, // required
      isDollar: boolean, //required
      dollarPrice: string // not required (?)
      otherCosts: string // not required (?)
      finalPrice: string // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created user product id
    }
    ```

### Update User Product

- Method: `PUT`
- Route: `/update`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      id: number, // required
      isDollar: boolean, // not required
      dollarPrice: string // not required (?)
      otherCosts: string // not required (?)
      finalPrice: string // not required
    }
    ```

- Response:

  - Body: `nil`

### Fetch Shop

- Method: `GET`
- Route: `/fetch-shop`
- Needs Authorization: `true`

- Response:

  - Body:

    ```json
    {
      shopInfo:
        {
          id: number,
          userId: number,
          shopName: string,
          likesCount: number,
          onlineDollarPrice: number,
          shopAddress: string,
          shopPhone1: string,
          shopPhone2: string,
          shopPhone3: string,
          telegramUrl: string,
          instagramUrl: string,
          whatsappUrl: string,
          websiteUrl: string,
          imageUrl: string,
          latitude: string,
          longitude: string,
          productsCount: number,
          isLiked: boolean
        }
      products:
        [
          {
            id: number,
            productId: number,
            brandId: number,
            modelId: number,
            dollarPrice: number,
            rialPrice: number,
            finalPrice: number,
            order: number,
            createdAt: time,
            updatedAt: time,
            categoryTitle: string,
            brandTitle: string,
            modelTitle: string,
            defaultImageUrl: string,
            description: string,
          }
        ]
    }
    ```

### Fetch Shop By User Id

- Method: `GET`
- Route: `/fetch-shop/:uid`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      userId: number, // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      shopInfo:
        {
          id: number,
          userId: number,
          shopName: string,
          likesCount: number,
          onlineDollarPrice: number,
          shopAddress: string,
          shopPhone1: string,
          shopPhone2: string,
          shopPhone3: string,
          shopTelegramUrl: string,
          shopInstagramUrl: string,
          shopWebsiteUrl: string,
          ProductsCount: number,
          isLiked: boolean,
        }
      products:
        [
          {
            id: number,
            productId: number,
            brandId: number,
            modelId: number,
            dollarPrice: number,
            rialPrice: number,
            finalPrice: number,
            order: number,
            createdAt: time,
            updatedAt: time,
            brandTitle: string,
            modelTitle: string,
            defaultImageUrl: string,
            description: string,
            isLiked: boolean,
            shopsCount: number
          }
        ]
    }
    ```

### Change User Product Order

- Method: `POST`
- Route: `/change-order`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      topProductId: number, // required
      bottomProductId: number, // required
    }
    ```

- Response:

  - Body: `null`

### Fetch Shop Products

- Method: `GET`
- Route: `/fetch-shops`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:
    - Query Parameters:
      - `productId`: `number`

- Response:

  - Body:

    ```json
    {
      shopProduct: [
        {
          id: number,
          userId: number,
          productId: number,
          brandId: number,
          modelId: number,
          dollarPrice: string,
          rialPrice: string,
          finalPrice: string,
          order: number,
          shopCity: string,
          shopName: string,
          shopPhone1: string,
          shopPhone2: string,
          shopPhone3: string,
          likesCount: number,
          defaultImageUrl: string,
          isLiked: bool,
          createdAt: DateTime,
          updatedAt: DateTime
        }
      ],
      productInfo: {
        id: number,
        categoryId: number,
        brandId: number,
        modelId: number,
        description: string,
        state: ProductState,
        categoryTitle: string,
        brandTitle: string,
        modelTitle: string,
        defaultImageUrl: string
        images: [
          {
            id: number,
            productId: number,
            url: string,
            isDefault: boolean
          }
        ],
        filterRelations: [
          {
            id: number,
            productId: number,
            filterId: number,
            filterOptionId: number,
            filterName: string,
            filterOptionName: string
          }
        ],
        tags: [
          {
            id: number,
            productId: number,
            tag: string,
          }
        ]
      }
    }
    ```

### Export Price List as pdf file

- Method: `GET`
- Route: `/fetch-price-list`
- Needs Authorization: `true`

- Response:

  - Body:

    ```json
    {
      shopInfo:
        {
          shopName: string,
          shopAddress: string,
          shopPhone1: string,
          shopPhone2: string,
          shopPhone3: string,
          shopTelegramUrl: string,
          shopInstagramUrl: string,
          shopWebsiteUrl: string,
          ProductsCount: number,
        }
      products:
        [
          {
            id: number,
            productTitle: string,
            categoryTitle: string,
            brandTitle: string,
            modelTitle: string,
            finalPrice: number,
            defaultFilter: {
              id: number,
              productId: number,
              filterId: number,
              filterOptionId: number,
              filterName: string,
              filterOptionName: string
            }
          }
        ]
    }
    ```

### Fetch User Products By filter

- Method: `POST`
- Route: `/fetch-products`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      categoryId: number // not required - to filter by category
      searchText: string // not required
    }
    ```

- Response:

  - Body:

    ```json
    {
      productItems: [
        {
          id: number,
          categoryId: number,
          brandId: number,
          modelId: number,
          defaultImageUrl: string,
          description: string,
          state: ProductState,
          likesCount: number,
          shopsCount: number,
          createdAt: DateTime,
          updatedAt: DateTime
          categoryTitle: string,
          brandTitle: string,
          modelTitle: string,
          tags: string[],
          filterOptionIds: []number,
          price: string,
          isLiked: boolean
        }
      ],
      filters: [
        {
          filter: {
            id: number,
            name: string,
            displayName: string
          },
          options: [
            {
              id: number,
              filterId: number,
              name: string
            }
          ]
        }
      ],
      brands: [
        {
          id: number,
          title: string
        }
      ],
      models: [
        {
          id: number,
          title: string
        }
      ]
    }

    enum ProductState {
      Confirmed = 1
    }
    ```

### Delete User Product

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  - Body:

    ```json
    {
      id: number
    }
    ```

- Response:
  - Body: `null`

### Fetch User Product By User Product ID

- Method: `GET`
- Route: `/fetch/:upId`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:
    - Query Parameters:
      - `upId`: `number`

- Response:

  - Body:

    ```json
    {
      userId: number,
      productId: number,
      categoryId: number,
      brandId: number,
      modelId: number,
      isDollar: boolean,
      dollarPrice: number,
      otherCosts: number,
      finalPrice: number,
      order: number,
      createdAt: time,
      updatedAt: time,
      productBrand: string,
      productModel: string,
      description: string,
      defaultImageUrl: string,
      defaultFilter: {
        id: number,
        productId: number,
        filterId: number,
        filterOptionId: number,
        filterName: string,
        filterOptionName: string
      }
    }
    ```

### Change User Product Visibility Status

- Method: `POST`
- Route: `/change-status`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      userProductId: number, // required
    }
    ```

- Response:
  - Body: `null`

---

### Favorite Product Service

- Base Route: `/favorite-product`

### Create Favorite Product (Like a Product)

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      productId: number // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created favorite product id
    }
    ```

### Delete Favorite Product (UnLike a Product)

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      productIDs: number[], // required
    }
    ```

- Response:
  - Body: `null`

### Get Favorite Products By User ID

- Method: `GET`
- Route: `/my-favorite-products`
- Needs Authorization: `true`
- Response:

  - Body:

    ```json
    [
      {
        id: number,
        userId: number,
        productId: number,
        productCategoryTitle: string,
        productBrandTitle: string,
        productModelTitle: string,
        productShopCount: number,
        productPrice: number,
        productDefaultImageUrl: string,
        productCreationAt: time
      }
    ]
    ```

---

### Product Request Service

- Base Url: `/product-request`

### Create Product Request

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Body:

    ```json
    {
      description: string // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created product request id
    }
    ```

### Fetch Product Request

- Method: `GET`
- Route: `/fetch/:id`
- Needs Authorization: `true`
- Request:

  - Query Parameters:
    - `id`: `number` (product request id)

- Response:

  - Body:

    ```json
    {
      id: number,
      userId: number,
      description: string,
      state: ProductRequestState,
      userName: string,
      phoneNumber: string,
      userType: UserType,
      city: string,
    }

    enum ProductRequestState {
      New = 1
      Checked = 2
    }
    enum UserType {
      Wholesaler = 3
      Retailer = 4
    }
    ```

### Delete Product Request

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  - Body:

    ```json
    {
      ids: number[]
    }
    ```

- Response:
  - Body: `null`

### Fetch All Product Requests

- Method: `GET`
- Route: `/fetch-all`
- Needs Authorization: `true`
- Request:

  - Body: `null`

- Response:

  - Body:

    ```json
    [
      {
        id: number,
        userId: number,
        description: string,
        state: ProductRequestState
      }
    ]

    enum ProductRequestState {
      New = 1
      Checked = 2
    }
    ```

### Mark Product Request As Checked

- Method: `POST`
- Route: `/mark-as-checked`
- Needs Authorization: `true`
- Request:

  - Body:

    ```json
    {
      productRequestId: number // required
    }
    ```

- Response:
  - Body: `null`

---

### Favorite Account Service

- Base Route: `/favorite-account`

### Create Favorite Account (Like an account)

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      targetUserId: number, // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created favorite account id
    }
    ```

### Get Favorite Accounts By User ID

- Method: `GET`
- Route: `/my-favorite-accounts`
- Needs Authorization: `true`
- Response:

  - Body:

    ```json
    [
      {
        shopName: string,
        shopAddress: string,
        shopPhone1: string,
        shopPhone2: string,
        shopPhone3: string,
        shopLikesCount: number,
        shopCreationAt: time,
      }
    ]
    ```

### Get My Customers

- Method: `GET`
- Route: `/my-customers`
- Needs Authorization: `true`
- Response:

  - Body:

    ```json
    [
      {
        customerName: string,
        customerShopType: UserRole,
      }
    ]
    enum UserRole {
      Wholesaler = 3
      Retailer = 4
      }
    ```

### Delete Favorite Account (unlike)

- Method: `POST`
- Route: `/delete`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

  ```json
  {
    ids: number[] // required
  }
  ```

- Response:

  - Body: `nil`

---

### User Subscription Service

- Base Route: `/user-subscription`

### Fetch Subscriptions By User ID

- Method: `POST`
- Route: `/fetch/:cityId`
- Needs Authorization: `true`
- Request:

  - Query Parameters:
    - `cityId`: `number` (city id)

- Response:

  - Body:

    ```json
    [
      {
        id: number,
        price: string,
        numberOfDays: SubscriptionPeriod,
        createdAt: DateTime,
        updatedAt: DateTime
      }
    ]

    enum SubscriptionPeriod {
      OneMonth = 1,
      ThreeMonths = 2,
      SixMonths = 3,
      OneYear = 4,
    }
    ```

### Fetch Payment Gateway Info

- Method: `POST`
- Route: `/fetch-payment-gateway-info`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      cityId: number, // required
      subscriptionId: number, // required
      callBackUrl: string, // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      paymentUrl: string, // url to navigate to payment gateway
      authority: string
    }
    ```

### Create User Subscription

- Method: `POST`
- Route: `/create`
- Needs Authorization: `true`
- Request:

  - Content-Type: `application/json`
  - Body:

    ```json
    {
      authority: string // required
    }
    ```

- Response:

  - Body:

    ```json
    {
      id: number // created user subscription id
    }
    ```

### Fetch User Payment Transactions History

- Method: `GET`
- Route: `/fetch-payment-transactions`
- Needs Authorization: `true`
- Response:

  - Body:

    ```json
    [
      {
        id: number,
        userId: number,
        cityId: number,
        fullName: string,
        city: string,
        refId: number,
        authority: string,
        cost: number,
        numberOfDays: SubscriptionPeriod,
        createdAt: time,
        updatedAt: time,
      }
    ]

    enum SubscriptionPeriod {
      OneMonth = 1,
      ThreeMonths = 2,
      SixMonths = 3,
      OneYear = 4,
    }
    ```

### Fetch User Subscriptions List

- Method: `GET`
- Route: `/fetch-user-subscriptions`
- Needs Authorization: `true`
- Response:

  - Body:

    ```json
    [
      {
        id: number,
        userId: number,
        cityId: number,
        subscriptionId: number,
        price: number,
        numberOfDays: SubscriptionPeriod,
        createdAt: time,
        updatedAt: time,
      }
    ]

    enum SubscriptionPeriod {
      OneMonth = 1,
      ThreeMonths = 2,
      SixMonths = 3,
      OneYear = 4,
    }
    ```

---

### Landing Page Service

- Base Route: `/`

### Get Landing Page

- Method: `GET`
- Route: `/landing-info`
- Needs Authorization: `false`

- Response:

  - Body:

    ```json
    {
      productCount: number,
      wholesalerCount: number,
      retailerCount: number,
    }
    ```
