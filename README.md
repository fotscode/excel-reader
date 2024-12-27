# Excel Reader

Esta aplicación tiene como objetivo leer archivos con extensión `.xlsx` con un formato (esquema) determinado por el usuario. Esto permite copiar los datos de un archivo binario a una colección de mongodb con verificaciónes de tipos.

## Precondiciones

Se debe tener instalado:

- [node](https://nodejs.org/en) (v23.5.0)
- [git](https://git-scm.com/)
- [mongodb](https://www.mongodb.com/) (v6.0.19)
- [docker](https://www.docker.com/) (v20.10.7) y [docker-compose](https://github.com/docker/compose) (v1.29.2)
- yarn o npm

Se utilizan los siguientes puertos:

- 3000 (api)
- 5671, 5672, 15691, 15692 (rabbitmq)
- 27017 (mongodb)

Por lo que ninguno de ellos se debe estar utilizando previo al despliegue de la aplicación o resultará en un error.

## Uso

Como primer requisito se debe clonar el repositorio:

```sh
git clone git@github.com:fotscode/excel-reader.git
cd excel-reader
```

Segun la herramienta de build que se quiera utilizar los comandos son diferentes, por lo que se enumeraran diferentes alternativas con el mismo objetivo.

### Usando docker-compose

Utilizando el archivo `compose.yml` provisto, y este los `Dockerfile`'s, solo se necesita realizar la siguiente directiva:

```sh
docker-compose up
```

### Usando yarn/npm

Levantar los servicios de `mongodb` y de `RabbitMQ`:

```sh
docker-compose up mongodb rabbitmq
```

La utilizacion de yarn/npm, en este caso, es equivalente por lo que se pueden reemplazar los siguientes comandos con `yarn`. El primer paso es instalar las dependencias:

```sh
npm install
```

Para inicializar la API se utiliza el siguiente comando:

```sh
npm run dev
```

Luego para inicializar el consumidor de `RabbitMQ`, en otra terminal, se utiliza:

```sh
npm run consumerDev
```

A su vez, otra opción es utilizar los archivos compilados por `tsc`. Para realizar esto se proveen las siguientes directivas:

```sh
npm run build
npm run preview # api [en una terminal, o utilizar &]
npm run consumerPreview # consumidor [en otra terminal]
```
