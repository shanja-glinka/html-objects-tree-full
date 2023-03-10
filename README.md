# studious-octo-waddle

Test Job Solution for KIT Job

# Requirements

For usage:
* PHP 5.6-x64
* Apache 2.4-x64
* MySQL 5.6-x64


Don't forget to switch sql_mode= "" in MySQL

# Usage

The `description` is opened by clicking on the group/item name

```http
  GET /Index
  GET /admin
  GET /admin?create_user
  GET /admin?signout
```

API:
```http
  GET /struct/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `title`      | `string` | **Optional** |

```http
  POST /struct
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `title`      | `string` | **Required** |
| `parent`      | `int` | **Required** |
| `descr`      | `string` | **Optional** |

```http
  PUT /struct/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**|
| `title`      | `string` | **Required** |
| `descr`      | `string` | **Optional** |

```http
  DELETE /struct/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**|



# Installation
The database configuration is in

```bash
  /assets/data/config.php
```

Use the key `connection` to make changes to the database 


Download the database from

```bash
  /assets/data/studious-octo-waddle.sql
```
Don't forget to switch sql_mode= "" in MySQL

For the test, use the login `admin` and the password `admin` in
```http
  GET /admin
```

Or create your user
```http
  GET /admin?create_user
```

Enable `ignoreServer = false` to use offline mode
```bash
  /assets/js/app.js
```