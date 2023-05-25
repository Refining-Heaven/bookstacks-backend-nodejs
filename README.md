# booksstack-backend

## Creating the first Model (and Migration):
  ### `npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string`

## Creating the first Seed:
  ### `npx sequelize-cli seed:generate --name demo-user`

## Running Migrations:
  ### `npx sequelize-cli db:migrate`

## Undoing Migrations:
  ### `npx sequelize-cli db:migrate:undo`

## Running Seeds:
  ### `npx sequelize-cli db:seed:all`

## Undoing Seeds:

## Undo the most recent seed:
### `npx sequelize-cli db:seed:undo`

## If you wish to undo all seeds:
### `npx sequelize-cli db:seed:undo:all`

