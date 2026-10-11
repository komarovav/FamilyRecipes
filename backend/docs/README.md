# Backend

Серверная часть **Family Recipes**.  
Обрабатывает запросы от веб- и мобильного клиента, работает с PostgreSQL.

## Общее описание

Backend отвечает за:

- регистрацию и аутентификацию пользователей (JWT)
- хранение пользователей и рецептов
- выдачу списка рецептов и конкретного рецепта
- создание рецепта с ингредиентами

## Стек

- Python
- FastAPI
- SQLAlchemy (async)
- PostgreSQL
- JWT
- Хеширование паролей (passlib / bcrypt)

## Что реализовано

### Авторизация

- `POST /auth/register` — регистрация
- `POST /auth/login` — вход, выдача JWT
- `GET /auth/me` — текущий пользователь
- `DELETE /auth/me` — удаление аккаунта

Пароль в БД хранится в виде хеша.  
Токен подписывается `SECRET_KEY`, время жизни 24 часа.

### Рецепты

- `POST /recipes` — создать рецепт
- `GET /recipes` — список рецептов текущего пользователя
- `GET /recipes/{id}` — один рецепт (только свой)

Ингредиенты сохраняются через связующую таблицу `Recipe_ingredients`.

### Модели (отдельные модули)

- `User` — пользователь
- `Recipe` — рецепт
- `Ingredient` — ингредиент
- `RecipeIngredient` — связь рецепт и ингредиент

## Что нужно добавить
- PUT/PATCH и DELETE для рецепта
- Поиск и фильтр (по названию, по типу)
- Загрузка изображений

## Структура

- `app/main.py` — точка входа
- `app/auth.py` — пароли, JWT
- `app/routers/` — эндпоинты auth и recipes
- `app/schemas.py` — схемы Pydantic (валидация JSON)
- `app/database.py` — подключение к БД
- `app/config.py` — настройки из `.env`

## Как запустить

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
