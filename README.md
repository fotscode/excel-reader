# Excel Reader

Esta aplicación tiene como objetivo leer archivos con extensión `.xlsx` con un formato (esquema) determinado por el usuario. Esto permite copiar los datos de un archivo binario a una colección de mongodb con verificaciónes de tipos.

## Precondiciones

Se debe tener instalado:

- [git](https://git-scm.com/)
- [docker](https://www.docker.com/) (v20.10.7)
- [docker-compose](https://github.com/docker/compose) (v1.29.2)

En caso de no querer usar `docker`:

- [node](https://nodejs.org/en) (v23.5.0)
- [RabbitMQ](https://www.rabbitmq.com/) (v4.0.5)
- [mongodb](https://www.mongodb.com/) (v6.0.19)
- [yarn](https://classic.yarnpkg.com/en/docs) (v1.22.22) o [npm](https://www.npmjs.com/) (v10.9.2)

Se utilizan los siguientes puertos:

- `3000` (api)
- `5672` (rabbitmq)
- `27017` (mongodb)

Por lo que ninguno de ellos se debe estar utilizando previo al despliegue de la aplicación o resultará en un error.

## Despliegue

Como primer requisito se debe clonar el repositorio:

```bash
git clone git@github.com:fotscode/excel-reader.git
cd excel-reader
```

Segun la herramienta de build que se quiera utilizar los comandos son diferentes, por lo que se enumeraran diferentes alternativas con el mismo objetivo: desplegar la aplicación.

### Usando docker-compose

Utilizando el archivo `compose.yml` y los `Dockerfile`'s provistos, solo se necesita realizar la siguiente directiva:

```bash
docker-compose up -d
```

### Usando yarn/npm

Levantar los servicios de `mongodb` y de `RabbitMQ` usando `docker-compose`:

```bash
docker-compose up mongodb rabbitmq
```

La utilización de yarn/npm, en este caso, es equivalente por lo que se pueden reemplazar los siguientes comandos con `yarn`. El primer paso es instalar las dependencias:

```bash
npm install
```

Para inicializar la API se utiliza el siguiente comando:

```bash
npm run dev
```

Luego para inicializar el consumidor de `RabbitMQ`, en otra terminal, se utiliza:

```bash
npm run consumerDev
```

A su vez, otra opción es utilizar los archivos compilados por `tsc`. Para realizar esto se proveen las siguientes directivas:

```bash
npm run build
npm run preview # api [en una terminal, o utilizar &]
npm run consumerPreview # consumidor [en otra terminal]
```

## Uso

Luego de desplegar la aplicación, para utilizarla se recomienda usar [postman](https://www.postman.com/), que sirve para interactuar con la API y que es de gran ayuda para el endpoint de subir un archivo. Se provee en `docs/postman.json` una colección de postman con ejemplos de estos endpoints junto a las configuraciones de autenticación.

### Autenticación y autorización

Los endpoints de la aplicación son envueltos por una capa de autenticación y autorización. La autenticación se realiza mediante el header `Authorization` y como método de autenticación se utiliza `Basic authentication`.

Como ejemplos se agregan a la base de datos tres usuarios:

- `admin:admin` con el rol `admin` (permisos `[REQUEST, UPLOAD]`) tiene el header `Authorization: Basic YWRtaW46YWRtaW4=`
- `watcher:watcher` con el rol `watcher` (permisos `[REQUEST]`) tiene el header `Authorization: Basic d2F0Y2hlcjp3YXRjaGVy`
- `empty:empty` sin roles (por ende sin permisos) tiene el header `Authorization: Basic ZW1wdHk6ZW1wdHk=`

En caso de fallar la autenticación se retorna un `401`, en caso de que falle la autorización se retorna un `403`.

Existen dos endpoints en la aplicación y se describen a continuación

### POST upload/

En este endpoint se sube un archivo y se encola la tarea, para que esta pueda ser tomada por un consumidor de RabbitMQ, el cual procesará el archivo. Require el permiso `UPLOAD`.

Para mandar el archivo se lo colocá en el body de la request, este body tiene un formato `multipart/form-data`. Dentro del campo `file` se coloca el archivo y en el campo `format` se coloca el esquema.

Ejemplos de `format` pueden ser:

- `{name: String, age: Number, nums: Array<Number>}`
- `{age: Number, name: String, nums?: Array<Number>}`

Como respuesta se espera el `UUID` de la tarea encolada.

Se proveen en la carpeta `examples/` ejemplos de archivos con extensión `.xlsx`:

- `name_age_nums_provided.xlsx`, archivo con columnas `name,age,nums` con 2 filas:
    - `Esteban,12,"3,8,1,9,100,34,78,32,97,12"`
    - `24,Texto,`
- `name_age_nums_200k.xlsx`, archivo con columnas `name,age,nums` con 200 mil filas respetando el órden y los numeros como opcionales (array de tamaño `[0,9]`).
- `name_age_nums_5000length.xlsx`, archivo con columnas `name,age,nums` con mil filas respetando el órden y los numeros como opcionales (array de tamaño `[0,5000]`).

### GET status/UUID-upload-status

Con el `UUID` obtenido del endpoint anterior, se puede consultar el estado de la tarea. Requiere el permiso `REQUEST`.

Los estados posibles son cuatro:

- `pending`: cuando fue encolada pero no fue tomada por ningún consumidor
- `processing`: cuando fue tomada por un consumidor
- `done`: cuando la tarea terminó exitosamente
- `error`: cuando la tarea falla por alguna causa externa al procesamiento

A su vez la respuesta contiene los errores de procesamiento, indicando fila y columna del error. Estos se pueden paginar utilizando los parametros de query `limit` y `page`, por ejemplo:

- `GET status/UUID-status?limit=5&page=2`

## Arquitectura

Un gráfico simple de la arquitectura pensada se puede ver en esta imágen:

![gráfico de arquitectura con los servicios utilizados de forma general](./docs/arch_services.png)

Se utiliza [typescript](https://www.typescriptlang.org/) como lenguaje de programación y [express](https://expressjs.com/) como framework de backend.

Por otra parte se utiliza [RabbitMQ](https://www.rabbitmq.com/) como broker de mensajes. La utilización de un broker proviene de la necesidad de mantener la API lo más ligera posible, mientras que un consumidor de la cola de mensajes se encarga de realizar el procesamiento, liberando a la interfaz `HTTP` del procesamiento.

Para guardar el estado de la tarea y los errores que se encuentra en la misma se utiliza [mongodb](https://www.mongodb.com/). A nivel de aplicación la interacción entre los servicios se puede ver de la siguiente manera:

![gráfico de interacción de servicios junto a la aplicación dividido en unidades lógicas con un mayor detalle](./docs/arch_interaction.png)

`UploadFile`, `ProcessFile` y `RequestStatus` son las funcionalidades claves (`use-cases`) de la aplicación. En mayor detalle se puede ver la organización del código como varios anillos, dónde las dependencias van hacia el centro, siendo el centro independiente del resto (siguiendo [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)).

![gráfico de anillos concéntricos respetando la regla de la dependencia y la separación en capas](./docs/arch_circle.png)
