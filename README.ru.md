# studious-octo-waddle

Решение тестового задания для KIT

# Требования к срерверу

For usage:
* PHP 5.6-x64
* Apache 2.4-x64
* MySQL 5.6-x64


В MySQL требуется отключить строгий режим `sql_mode= ""`

# Использование

`Описание` открывается путем клика на название группы/элемента

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



# Установка
Конфигурационный файл находится в дирректории `/assets/data/`

```bash
  /assets/data/config.php
```

Для соединения с бд измени ключ `connection` 


Загрузи базу данных из дирректории `/assets/data/`

```bash
  /assets/data/studious-octo-waddle.sql
```

В MySQL требуется отключить строгий режим `sql_mode= ""`