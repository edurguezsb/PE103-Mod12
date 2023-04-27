# Práctica 11

## Los github Actions están correctamente configurados.

[![Coverage Status](https://coveralls.io/repos/github/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-edurguezsb/badge.svg?branch=master)](https://coveralls.io/github/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-edurguezsb?branch=master)

[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-orange.svg)](https://sonarcloud.io/summary/new_code?id=ULL-ESIT-INF-DSI-2223_ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-edurguezsb)


En esta actividad, la Práctica 11 de la asignatura, se nos plantean realizar una serie de ejercicios, y también a mejorar la aplicación de Funkos que habíamos desarrollado en la práctica anterior. También, al igual que llevamos haciendo en prácticas anteriores hasta ahora, a parte de llevar a cabo una buena estructura y organización de ficheros y directorios, no debemos olvidarnos de utilizar los principios SOLID,sus pruebas TDD o BDD para confirmar el correcto funcionamiento del código desarrollado, todo el código con comentarios tipo TypeDoc, cubrimiento de código con Istanbul y Coveralls, Sonar Cloud para analizar la calidad, y los github actions.

Los objetivos de esta práctica son seguir familiarizándonos con el manejo de las herramientas mencionadas anteriormente ya que son bastante fundamentales a la hora de realizar un proyecto en TypeScript para asegurarnos de que nuestra solución es buena, y que serán necesarios para el correcto desarrollo y avance en la asignatura de Desarrollo de Sistemas Informáticos que próximamente en 2 o 3 prácticas más llegará a su fin.


También será explicado a continuación el ejercicio realizado en clase en el grupo PE103, y después el resto de ejercicios propuestos en el guión:

## Ejercicio PE103

### Enunciado

- Desarrolle un cliente y un servidor en Node.js, haciendo uso de sockets, que incorporen la siguiente funcionalidad:
El cliente debe recibir, desde la línea de comandos, un comando Unix/Linux, además de sus argumentos correspondientes, que ejecutaremos en el servidor.
El servidor debe recibir la petición del cliente, procesarla, esto es, ejecutar el comando solicitado, y devolver la respuesta del comando al cliente. Para ello, piense que el comando solicitado puede haberse ejecutado correctamente o puede haber fallado, por ejemplo, por no existir o porque se le han pasado unos argumentos no válidos.

#### Código

- En el directorio src/Ejercicio-PE103 tenemos ```server.ts```:

```TypeScript
import net from 'net';
import { spawn } from 'child_process';

/**
 * Creamos un servidor que escucha en el puerto 8100 y espera recibir mensajes JSON desde un cliente.
 * Cuando se recibe un mensaje que tiene el campo 'type' establecido en 'command', ejecuta el comando
 * especificado en el campo 'com' junto con los parámetros especificados en el campo 'param'.
 * El resultado de la ejecución del comando se envía de vuelta al cliente a través de la conexión.
 */
net.createServer((connection) => {
  connection.on('data', (data) => {
    // Convertir los datos recibidos en un objeto JavaScript utilizando JSON.parse.
    let mensaje = JSON.parse(data.toString());

    // Si el mensaje recibido es un comando, ejecutarlo y enviar la salida de vuelta al cliente.
    if(mensaje.type == 'command') {
      console.log("Se ejecutara el comando: " + mensaje.com + " " + mensaje.param);
      let salida;
      if(mensaje.param == undefined) {
        // Si no hay parámetros, solo se ejecuta el comando.
        salida = spawn(mensaje.com);
      } else {
        // Si hay parámetros, se pasan como argumentos al comando.
        salida = spawn(mensaje.com, [mensaje.param]);
      }

      // Enviar cualquier salida de error del comando de vuelta al cliente a través de la conexión.
      salida.stderr.on('data', (data) => {
        connection.write(data.toString());
      });

      // Enviar cualquier salida estándar del comando de vuelta al cliente a través de la conexión.
      salida.stdout.on('data', (data) => {
        connection.write(data.toString());
      });
    }
  });

  // Cuando se cierra la conexión, imprimir un mensaje en la consola.
  connection.on('close' , () => {
    console.log('Cliente ha sido desconectado');
  });

// Escuchar en el puerto 8100 y imprimir un mensaje en la consola cuando el servidor está listo.
}).listen(8100, () => {
  console.log('Servidor a la espera escuchando puerto 8100');
});
```

Se crea un servidor que escucha en el puerto 8100 y espera recibir mensajes JSON desde un cliente. Cuando se recibe un mensaje que tiene el campo ```type``` establecido en ```command```, ejecuta el comando especificado en el campo ```com``` junto con los parámetros especificados en el campo ```param```. El resultado de la ejecución del comando se envía de vuelta al cliente a través de la conexión. Si hay algún error en la ejecución del comando, se envía de vuelta al cliente a través de la conexión. Cuando se cierra la conexión, se imprime un mensaje en la consola. El servidor está listo para recibir conexiones en el puerto 8100.

- También tenemos ```client.ts```:

```TypeScript
import net from 'net';

/**
 * Crear una instancia de un cliente de conexión TCP/IP mediante la librería 'net'.
 * Conectar el cliente al puerto 8100.
 */
const client = net.connect({port: 8100});

/**
 * Se ejecuta cuando el cliente establece conexión con éxito.
 * Envía un comando al servidor en formato JSON, basado en los argumentos proporcionados al invocar el script.
 */
client.on('connect' , () => {
  if (process.argv.length < 3) { 
    // Si no se proporciona ningún comando al invocar el script, se muestra un error y se finaliza el proceso.
    console.log("Error: No se ha introducido ningún comando");
    process.exit(1);
  }
  // Enviar un objeto JSON al servidor, indicando el tipo de comando, el comando en sí mismo y un parámetro (si se proporciona).
  client.write(JSON.stringify({'type': 'command', 'com': process.argv[2], 'param': process.argv[3]}));
});

/**
 * Se ejecuta cuando el cliente recibe datos del servidor.
 * Muestra los datos recibidos por la consola y finaliza la conexión.
 */
client.on('data', (data) => {
  console.log(data.toString());
  client.end();
});

/**
 * Se ejecuta cuando la conexión con el servidor se cierra.
 * Muestra un mensaje por consola indicando que el cliente se ha desconectado.
 */
client.on('close', () => {
  console.log('Cliente desconectado');
});
```

Este código establece una conexión TCP/IP mediante la librería ```net``` con un servidor en el puerto 8100 y envía un comando en formato JSON al servidor, basado en los argumentos proporcionados al invocar el script. Si no se proporciona ningún comando, se muestra un error y se finaliza el proceso. Cuando el cliente recibe datos del servidor, muestra los datos recibidos por la consola y finaliza la conexión. Y cuando la conexión con el servidor se cierra, muestra un mensaje por consola indicando que el cliente se ha desconectado.



## Ejercicio 1

### Enunciado

Considere el siguiente ejemplo de código fuente TypeScript que hace uso del módulo fs de Node.js:

```TypeScript
import {access, constants, watch} from 'fs';

if (process.argv.length !== 3) {
  console.log('Please, specify a file');
} else {
  const filename = process.argv[2];

  access(filename, constants.F_OK, (err) => {
    if (err) {
      console.log(`File ${filename} does not exist`);
    } else {
      console.log(`Starting to watch file ${filename}`);

      const watcher = watch(process.argv[2]);

      watcher.on('change', () => {
        console.log(`File ${filename} has been modified somehow`);
      });

      console.log(`File ${filename} is no longer watched`);
    }
  });
}
```

En primer lugar, ejecute el programa para tratar de comprender qué hace.

A continuación, realice una traza de ejecución mostrando, paso a paso, el contenido de la pila de llamadas, el registro de eventos de la API y la cola de manejadores, además de lo que se muestra por la consola. Para ello, simule que se llevan a cabo, como mínimo, dos modificaciones del fichero helloworld.txt a lo largo de la ejecución. ¿Qué hace la función access? ¿Para qué sirve el objeto constants?

#### Resultado

A continuación vemos cual sería la traza: 

1. El programa se inicia con el comando node programa.js helloworld.txt.
Pila de llamadas: [Función principal (global)]

2. Se importan las funciones 'access', 'constants' y 'watch' del módulo 'fs'.
Pila de llamadas: [Función principal (global)]

3. La longitud de 'process.argv' es 3 (node, programa.js y helloworld.txt).
Pila de llamadas: [Función principal (global)]

4. Se asigna el nombre del archivo a la variable 'filename'.
Pila de llamadas: [Función principal (global)]

5. Se llama a la función 'access' con 'filename', 'constants.F_OK' y una función de callback.
Pila de llamadas: [Función principal (global), access]

Registro de eventos de la API: []

6. La función 'access' verifica si el archivo 'helloworld.txt' existe y es accesible.
Pila de llamadas: [Función principal (global)]

Registro de eventos de la API: [Verificación de acceso al archivo]

7. La función 'access' no encuentra errores y pone en cola la función de callback.
Pila de llamadas: [Función principal (global)]

Cola de manejadores: [Función de callback de access]

8. La función de callback de 'access' se ejecuta.
Pila de llamadas: [Función principal (global), Función de callback de access]

9. Se imprime en consola: 'Starting to watch file helloworld.txt'.
Pila de llamadas: [Función principal (global), Función de callback de access]

10. Se crea un 'watcher' utilizando la función 'watch' con 'filename' como argumento.
Pila de llamadas: [Función principal (global), Función de callback de access]

11. Se registra un evento 'change' en el 'watcher', que se activa cuando el archivo es modificado.
Pila de llamadas: [Función principal (global), Función de callback de access]

12. Se imprime en consola: 'File helloworld.txt is no longer watched'.
Pila de llamadas: [Función principal (global)]

13. El usuario modifica el archivo 'helloworld.txt' por primera vez.
Registro de eventos de la API: [Evento 'change' en watcher]

14. El evento 'change' se activa y pone en cola el manejador correspondiente.
Pila de llamadas: [Función principal (global)]

Cola de manejadores: [Manejador del evento 'change']

15. El manejador del evento 'change' se ejecuta.
Pila de llamadas: [Función principal (global), Manejador del evento 'change']

16. Se imprime en consola: 'File helloworld.txt has been modified somehow'.
Pila de llamadas: [Función principal (global)]

17. El usuario modifica el archivo 'helloworld.txt' por segunda vez.
Registro de eventos de la API: [Evento 'change' en watcher]

18. El evento 'change' se activa nuevamente y pone en cola el manejador correspondiente.
Pila de llamadas: [Función principal (global)]

Cola de manejadores: [Manejador del evento 'change']

19. El manejador del evento 'change' se ejecuta nuevamente.
Pila de llamadas: [Función principal (global), Manejador del evento 'change']

20. Se imprime en consola: 'File helloworld.txt has been modified somehow'.
Pila de llamadas: [Función principal (global)]

21. No hay más eventos ni acciones por realizar. La ejecución del programa continúa a la espera de más eventos de modificación del archivo. Si el usuario cierra el programa, la pila de llamadas se vaciará y la aplicación finalizará.
Pila de llamadas: [Función principal (global)]

Esta traza de ejecución muestra el contenido de la pila de llamadas, el registro de eventos de la API y la cola de manejadores paso a paso, desde el inicio del programa hasta que se detectan dos modificaciones (como se nos indica en el enunciado) en el archivo ```helloworld.txt``` y se imprimen los mensajes correspondientes en la consola.


¿Qué hace la función access?

Es una función asíncrona que comprueba los permisos de acceso a un archivo o directorio. En este caso se comprueba si el archivo existe.

¿Para qué sirve el objeto constants?

Es una constante del paquete fs que determina si el fichero es accesible para lectura, escritura o ejecución, es decir, si el fichero existe.



## Ejercicio 2

### Enunciado


Escriba una aplicación que proporcione información sobre el número de líneas, palabras o caracteres que contiene un fichero de texto. La ruta donde se encuentra el fichero debe ser un parámetro pasado a la aplicación desde la línea de comandos. Adicionalmente, también deberá indicarle al programa desde la línea de comandos si desea visualizar el número de líneas, palabras, caracteres o combinaciones de ellas. Puede gestionar el paso de parámetros desde la línea de comandos haciendo uso de yargs.

Lleve a cabo el ejercicio anterior de dos maneras diferentes:

Haciendo uso del método pipe de un Stream para poder redirigir la salida de un comando hacia otro.
Sin hacer uso del método pipe, solamente creando los subprocesos necesarios y registrando manejadores a aquellos eventos necesarios para implementar la funcionalidad solicitada.
Para lo anterior, se recomienda leer la documentación de Stream. Piense que la propiedad stdin de un objeto ChildProcess es un Stream de escritura, mientras que su propiedad stdout es un Stream de lectura.

Por último, programe defensivamente, es decir, trate de controlar los potenciales errores que podrían surgir a la hora de ejecutar su programa. Por ejemplo, ¿qué sucedería si indica desde la línea de comandos un fichero que no existe o una opción no válida?

#### Código

- Usando pipe tenemos ```PipeReader.ts```:

```TypeScript
/**
 * Este módulo utiliza el paquete yargs para parsear argumentos de línea de comandos y opciones
 * para el comando wc (word count) de Linux para contar palabras, líneas y caracteres en un archivo de texto.
 * También utiliza los paquetes fs y child_process para leer el archivo y ejecutar comandos de shell, respectivamente.
 *
 * @packageDocumentation
 */

import {readFile} from 'fs';
import {spawn} from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Parsear argumentos de línea de comandos con yargs
yargs(hideBin(process.argv))
  .boolean(['l', 'w', 'm']) // Opciones booleanas que indican qué tipo de recuento de palabras se debe hacer
  .command('wc', 'word count of a text file', { // Comando "wc" para contar palabras de un archivo de texto
    file: { // Argumento requerido que especifica el archivo a procesar
      description: 'the file\'s name',
      type: 'string',
      demandOption: true
    }
  }, (argv) => { // Función que se ejecuta cuando se llama al comando "wc"
    readFile(argv.file, (err) => { // Leer el archivo especificado en el argumento
      if (err) {
        console.log(`No existe el fichero ${argv.file}`)
      }

      if (argv.l) {     
        const wcl = spawn('wc', ['-l', argv.file]);     
        const cut = spawn('cut', ['-d', ' ', '-f', '1']); 

        wcl.stdout.pipe(cut.stdin);
        cut.stdout.pipe(process.stdout);
      }

      if (argv.w) {        
        const wcw = spawn('wc', ['-w', argv.file]);     
        const cut = spawn('cut', ['-d', ' ', '-f', '1']); 

        wcw.stdout.pipe(cut.stdin);
        cut.stdout.pipe(process.stdout);
      }

      if (argv.m) {
        const wcm = spawn('wc', ['-m', argv.file]);     
        const cut = spawn('cut', ['-d', ' ', '-f', '1']); 

        wcm.stdout.pipe(cut.stdin);
        cut.stdout.pipe(process.stdout);
      }

      if (argv.l === undefined && argv.w === undefined && argv.m === undefined) {
        console.log('No ha utilizado ninguna de las opciones posibles (--l, --w, --m)');
      }
    })
  })
  .help() // Mostrar la ayuda
  .argv; // Ejecutar el programa
```

Este código utiliza los paquetes ```fs```, ```child_process``` y ```yargs``` para crear una herramienta en línea de comandos que cuenta palabras, líneas y caracteres en un archivo de texto. El script parsea los argumentos de línea de comandos usando yargs y verifica si se han especificado las opciones -l, -w o -m. Dependiendo de las opciones especificadas, el script utiliza spawn para ejecutar los comandos de Linux wc y cut para contar palabras, líneas y caracteres en el archivo de texto. Finalmente, el script muestra los resultados en la consola y, si no se ha especificado ninguna opción, muestra un mensaje de ayuda.

- Sin usar pipe tenemos ```NoPipeReader.ts```:

```TypeScript
/**
 * Librerías necesarias para la ejecución del script
 */
import {readFile} from 'fs';
import {spawn} from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * Configuración de las opciones del script a través de yargs
 */
yargs(hideBin(process.argv))
  /**
   * Opciones de tipo booleano: l, w, m
   */
  .boolean(['l', 'w', 'm'])
  /**
   * Definición del comando "wc"
   * Descripción: cuenta las palabras de un archivo de texto
   * Parámetro obligatorio: nombre del archivo a contar
   */
  .command('wc', 'word count of a text file', {
    file: {
      description: 'the file\'s name',
      type: 'string',
      demandOption: true
    }
  }, (argv) => {
    /**
     * Lee el archivo especificado y verifica si existe
     */
    readFile(argv.file, (err) => {
      if (err) {
        console.log(`No existe el fichero ${argv.file}`)
      }

      /**
       * Ejecuta el comando "wc" en la terminal con el archivo especificado
       */
      const wc = spawn('wc', [argv.file]);

      let wcOutput = '';
      /**
       * Captura la salida del comando "wc"
       */
      wc.stdout.on('data', (data) => wcOutput += data);

      /**
       * Muestra los resultados según las opciones seleccionadas
       */
      wc.on('close', () => {
        const wcOutputArray = wcOutput.split(" ");        
        if (argv.l) {
          console.log(`El fichero ${argv.file} tiene ${wcOutputArray[1]} líneas.`);
        }
        if (argv.w) {
          console.log(`El fichero ${argv.file} tiene ${wcOutputArray[3]} palabras.`);
        }
        if (argv.m) {
          console.log(`El fichero ${argv.file} tiene ${wcOutputArray[4]} caracteres.`);
        }
        if (argv.l === undefined && argv.w === undefined && argv.m === undefined) {
          console.log('No ha utilizado ninguna de las opciones posibles (--l, --w, --m)');
        }
      });

      /**
       * Muestra un mensaje de error si ocurre un problema al ejecutar el comando "wc"
       */
      wc.on('error', (err) => {
        console.error('Error al ejecutar el comando', err);
      });
    })
  })
  /**
   * Muestra la ayuda del script
   */
  .help()
  .argv;
```

Toma las opciones de línea de comandos especificadas por el usuario con yargs, lee el archivo de texto con ```readFile```, ejecuta el comando wc en la terminal para contar el número de palabras, líneas o caracteres en el archivo y muestra los resultados según las opciones seleccionadas por el usuario.


## Ejercicio 3 - FunkosAPP

### Enunciado

En este ejercicio tendrá que partir de la implementación de la aplicación de registro de Funko Pops que llevó a cabo en la Práctica 9 para escribir un servidor y un cliente haciendo uso de los sockets proporcionados por el módulo net de Node.js. Las operaciones que podrá solicitar el cliente al servidor deberán ser las mismas que ya implementó durante la Práctica 9, esto es, añadir, modificar, eliminar, listar y mostrar Funko Pops de un usuario concreto. Un usuario interactuará con el cliente de la aplicación, exclusivamente, a través de la línea de comandos. Al mismo tiempo, en el servidor, la información de los Funko Pops se almacenará en ficheros JSON en el sistema de ficheros, siguiendo la misma estructura de directorios utilizada durante la Práctica 9.

#### Código

A continuación se explica cada fichero de nuestra App:

- ```Client.ts```:

```TypeScript
import net from 'net'
import chalk from 'chalk'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { FunkoPop } from '../Funko/FunkoPop.js'
import { RequestType, ResponseType } from './FunkoApp.js'
import { checkType, checkGenre, createFunko } from './Helpers.js'

/**
 * Representa las opciones que un usuario puede pasar como argumentos a la línea de comandos.
 */
interface UserOptions {
  user: string
}

/**
 * Representa las opciones básicas que un usuario puede pasar como argumentos a la línea de comandos.
 */
interface BasicOptions {
  user: string
  id_: number
}

/**
 * Representa todas las opciones que un usuario puede pasar como argumentos a la línea de comandos.
 */
interface Options extends BasicOptions {
  name: string
  desc: string
  type: string
  genre: string
  brand: string
  brandId: number
  price: number
  exclusive: boolean
}

/**
 * Crea y devuelve una opción para ser usada en la línea de comandos.
 *
 * @param desc - La descripción de la opción.
 * @param tp - El tipo de la opción.
 * @param demand - Indica si la opción es obligatoria o no.
 * @returns La opción creada.
 */
function FillOption(desc: string, tp: string, demand: boolean) {
  const option = {}
  Object.assign(option, {
    description: desc,
    type: tp,
    demandOption: demand,
  })
  return option
}

/**
 * Agrega la opción 'user' a la línea de comandos.
 *
 * @param yargs - La instancia de yargs a la que se agrega la opción.
 * @returns La instancia de yargs con la opción agregada.
 */
const UserData = (yargs: yargs.Argv<UserOptions>) => {
  return yargs.option('user', FillOption('User name', 'string', true))
}

/**
 * Agrega las opciones 'user' e 'id' a la línea de comandos.
 *
 * @param yargs - La instancia de yargs a la que se agregan las opciones.
 * @returns La instancia de yargs con las opciones agregadas.
 */
const BasicData = (yargs: yargs.Argv<BasicOptions>) => {
  return yargs
    .option('user', FillOption('User name', 'string', true))
    .option('id', FillOption('Funko ID', 'number', true))
}

/**
 * Agrega todas las opciones a la línea de comandos.
 *
 * @param yargs - La instancia de yargs a la que se agregan las opciones.
 * @returns La instancia de yargs con las opciones agregadas.
 */

const FunkoData = (yargs: yargs.Argv<Options>) => {
  return yargs
    .option('user', FillOption('User name', 'string', true))
    .option('id', FillOption('Funko ID', 'number', true))
    .option('name', FillOption('Funko name', 'string', true))
    .option('desc', FillOption('Funko description', 'string', true))
    .option('type', FillOption('Funko type', 'string', true))
    .option('genre', FillOption('Funko genre', 'string', true))
    .option('brand', FillOption('Funko brand', 'string', true))
    .option('brandId', FillOption('Funko brand ID', 'number', true))
    .option('price', FillOption('Funko price', 'number', true))
    .option('exclusive', FillOption('Funko exclusive', 'boolean', false))
}

/**
 * Representa un cliente que se comunica con un servidor utilizando sockets para realizar operaciones CRUD en figuras Funko Pop.
 */
export class Client {
    /**
     * El socket utilizado para comunicarse con el servidor.
     */
    public socket = new net.Socket()
  
    /**
     * Crea una nueva instancia de cliente con las opciones especificadas.
     *
     * @param port - El número de puerto al que se conectará el cliente.
     * @param request - La solicitud inicial para enviar al servidor.
     */
    public constructor(
      public port = -1,
      public request: RequestType = { type: 'unknown', user: '' }
    ) {
      // Crea una interfaz de línea de comando para analizar la entrada del usuario
      const commands = yargs(process.argv.slice(2))
        // Agrega un comando para agregar una nueva figura Funko Pop
        .command('add', 'Agrega una figura Funko Pop', FunkoData, (argv) => {
          if (argv.type && !checkType(argv.type as string)) return
          if (argv.genre && !checkGenre(argv.genre as string)) return
          const funko = createFunko(argv)
          this.request = {
            user: argv.user as string,
            type: 'add',
            funkoPop: funko,
          }
        })
        // Agrega un comando para actualizar una figura Funko Pop existente
        .command('update', 'Actualiza una figura Funko Pop', FunkoData, (argv) => {
          if (argv.type && !checkType(argv.type as string)) return
          if (argv.genre && !checkGenre(argv.genre as string)) return
  
          const funko = createFunko(argv)
          this.request = {
            user: argv.user as string,
            type: 'update',
            funkoPop: funko,
          }
        })
        // Agrega un comando para eliminar una figura Funko Pop existente
        .command('remove', 'Elimina una figura Funko Pop', BasicData, (argv) => {
          this.request = {
            user: argv.user as string,
            type: 'remove',
            id: argv.id as number,
          }
        })
        // Agrega un comando para listar todas las figuras Funko Pop existentes
        .command('list', 'Lista todas las figuras Funko Pop', UserData, (argv) => {
          this.request = {
            user: argv.user as string,
            type: 'list',
          }
        })
        // Agrega un comando para buscar una figura Funko Pop por su ID
        .command('search', 'Busca una figura Funko Pop por su ID', BasicData, (argv) => {
          this.request = {
            user: argv.user as string,
            type: 'search',
            id: argv.id as number,
          }
        })
        .help()
  
      // Analiza los argumentos de la línea de comando si se proporcionan, de lo contrario muestra la ayuda
      if (process.argv.length > 2) commands.parse()
      else commands.showHelp()

    if (this.port < 0) console.log(chalk.red('Puerto no válido'))
  }


  /**
   * Se conecta al servidor a través de un socket, envía una solicitud y llama al callback con la respuesta.
   * @param {RequestType} request - La solicitud que se enviará al servidor.
   * @param {(response: ResponseType) => void} callback - La función que se llamará con la respuesta del servidor.
   * @returns {void}
   */
  public connect(
    request: RequestType,
    callback: (response: ResponseType) => void
  ) {
    this.socket.connect(this.port, 'localhost', () => {
      console.log(chalk.blue(`Client connected to port ${this.port}`));
      this.processCommand(request, (response) => {
        if (response) {
          this.socket.end();
          callback(response);
        }
      });
    });
  }

  /**
   * Procesa una solicitud y llama al callback con la respuesta del servidor.
   * @param {RequestType} request - La solicitud que se enviará al servidor.
   * @param {(response: ResponseType | undefined) => void} callback - La función que se llamará con la respuesta del servidor.
   * @returns {void}
   */
  private processCommand(
    request: RequestType,
    callback: (response: ResponseType | undefined) => void
  ) {
    if (request.type === 'unknown') {
      console.log(chalk.red('Unknown command'))
      callback(undefined)
    }
    console.log(
      chalk.blue(`Sending request to server: ${JSON.stringify(request)}`)
    )
    this.socket.write(JSON.stringify(request) + '\n')
    let data = ''
    this.socket.on('data', (chunk) => {
      data += chunk.toString()
    })
    this.socket.on('end', () => {
      const response: ResponseType = JSON.parse(data)
      switch (response.type) {
        case 'add':
          if (response.success)
            console.log(chalk.green('Funko added successfully'))
          else console.log(chalk.red('Already exists a funko with that ID'))
          break
        case 'update':
          if (response.success)
            console.log(chalk.green('Funko updated successfully'))
          else console.log(chalk.red('There is no funko with that ID'))
          break
        case 'remove':
          if (response.success)
            console.log(chalk.green('Funko removed successfully'))
          else console.log(chalk.red('There is no funko with that ID'))
          break
        case 'list':
          if (response.success) {
            if (response.funkoPops === undefined) return
            response.funkoPops.forEach((funko) => {
              FunkoPop.print(funko)
            })
          } else console.log(chalk.red('There are no funkos'))
          break
        case 'search':
          if (response.success) {
            if (response.funkoPops === undefined) return
            FunkoPop.print(response.funkoPops[0])
          } else console.log(chalk.red('There is no funko with that ID'))
          break
        default:
          console.log(chalk.red('Invalid response'))
      }
      callback(response)
    })
  }
}
```

Aquí tenemos al cliente que se comunica con un servidor utilizando sockets para realizar ciertas operaciones en figuras Funko Pop. Define varias interfaces y funciones que agregan opciones a la línea de comandos. Luego, utiliza la instancia de yargs para analizar la entrada del usuario y construir una solicitud que se envía al servidor a través del socket. El cliente recibe la respuesta del servidor y la procesa para imprimir mensajes de éxito o error según corresponda.

- ```FunkoApp.ts```:

```TypeScript
import net from 'net';
import chalk from 'chalk';
import { FunkoPop } from '../Funko/FunkoPop.js';
import { User } from '../User/user.js';

/**
 * Operaciones que se pueden realizar en la aplicación
 */
export type Operation =
  | 'add'
  | 'update'
  | 'remove'
  | 'search'
  | 'list'
  | 'unknown';

/**
 * Tipos de solicitudes que se pueden hacer en la aplicación
 */
export type RequestType = {
  user: string; // Usuario que hace la solicitud
  type: Operation; // Tipo de operación que se va a realizar
  funkoPop?: FunkoPop; // Información del FunkoPop en caso de ser necesaria
  id?: number; // Identificador del FunkoPop en caso de ser necesario
};

/**
 * Tipos de respuestas que se pueden obtener en la aplicación
 */
export type ResponseType = {
  type: Operation; // Tipo de operación que se realizó
  success: boolean; // Indica si la operación se realizó correctamente
  funkoPops?: FunkoPop[]; // Información de los FunkoPops en caso de ser necesario
};

/**
 * Clase que representa la aplicación de FunkoPops
 */
export class FunkoApp {
  public server: net.Server = new net.Server(); // Servidor de net

  /**
   * Constructor de la aplicación de FunkoPops
   * @param port Puerto en el que se va a iniciar el servidor
   */
  public constructor(public port = -1) {
    if (this.port >= 0) {
      this.start(); // Inicia el servidor
    } else {
      console.log(chalk.red('Invalid port')); // Muestra un mensaje de error en caso de que el puerto sea inválido
    }
  }

  /**
   * Método que inicia el servidor de la aplicación
   */
  public start(): void {
    this.server = net.createServer(this.handleConnection).listen(this.port, () => {
      console.log(chalk.green(`Server listening on port ${this.port}`)); // Muestra un mensaje en la consola indicando que el servidor está escuchando en un puerto específico
    });
  }

  /**
   * Método que maneja la conexión del servidor
   */
  private handleConnection = (connection: net.Socket): void => {
    console.log(chalk.yellow('Client connected'))
    let data = ''
    connection.on('data', (chunk) => {
      data += chunk.toString()
      if (data.includes('\n')) {
        const request: RequestType = JSON.parse(data)
        connection.write(JSON.stringify(this.proccessRequest(request)))
        connection.end()
        console.log(chalk.yellow('Client disconnected'))
      }
    })
  }

/**
 * Método privado para procesar una solicitud y devolver una respuesta
 * @param request - Tipo de solicitud a procesar
 * @returns Respuesta a la solicitud
 */
private proccessRequest = (request: RequestType): ResponseType => {
    // Se crea una instancia del usuario a partir de los datos de la solicitud
    const user = new User(request.user)
    // Se carga la colección del usuario
    user.load()
    // Se inicializa la respuesta como desconocida y sin éxito
    let response: ResponseType = { type: 'unknown', success: false }
    // Se ejecuta una acción en función del tipo de solicitud
    switch (request.type) {
      case 'add':
        response = this.processAdd(user, request.funkoPop)
        break
      case 'update':
        response = this.processUpdate(user, request.funkoPop)
        break
      case 'remove':
        response = this.processRemove(user, request.funkoPop)
        break
      case 'search':
        response = this.processSearch(user, request.funkoPop)
        break
      case 'list':
        response = this.processList(user)
        break
    }
    // Se guarda la colección actualizada del usuario
    user.save()
    // Se devuelve la respuesta a la solicitud
    return response
  }
  
  /**
   * Método privado para procesar la solicitud de añadir un FunkoPop a la colección de un usuario
   * @param user - Usuario al que se va a añadir el FunkoPop
   * @param funkoPop - FunkoPop que se va a añadir a la colección del usuario
   * @returns Respuesta a la solicitud de añadir un FunkoPop
   */
  private processAdd = (
    user: User,
    funkoPop: FunkoPop | undefined
  ): ResponseType => {
    // Si se proporciona un FunkoPop para añadir, se añade a la colección del usuario y se devuelve una respuesta de éxito o fracaso según el resultado
    if (funkoPop)
      return user.addFunko(funkoPop).includes('Already exists')
        ? { type: 'add', success: false }
        : { type: 'add', success: true }
    // Si no se proporciona un FunkoPop, se devuelve una respuesta de fracaso
    return { type: 'add', success: false }
  }
  
  /**
   * Método privado para procesar la solicitud de actualizar un FunkoPop en la colección de un usuario
   * @param user - Usuario al que se va a actualizar el FunkoPop
   * @param funkoPop - FunkoPop que se va a actualizar en la colección del usuario
   * @returns Respuesta a la solicitud de actualizar un FunkoPop
   */
  private processUpdate = (
    user: User,
    funkoPop: FunkoPop | undefined
  ): ResponseType => {
    // Si se proporciona un FunkoPop para actualizar, se actualiza en la colección del usuario y se devuelve una respuesta de éxito o fracaso según el resultado
    if (funkoPop)
      return user
        .updateFunko(funkoPop)
        .includes(`not in ${user.name}'s collection`)
        ? { type: 'update', success: false }
        : { type: 'update', success: true }
    // Si no se proporciona un FunkoPop, se devuelve una respuesta de fracaso
    return { type: 'update', success: false }
  }

    /**
     * Procesa la solicitud de eliminación de un FunkoPop de la colección de un usuario.
     * @param user - Usuario al que pertenece la colección.
     * @param funkoPop - FunkoPop que se desea eliminar.
     * @returns Objeto que indica si la operación fue exitosa o no.
     */
    private processRemove = (
      user: User,
      funkoPop: FunkoPop | undefined
    ): ResponseType => {
      if (funkoPop)
        return user
          .removeFunko(funkoPop.id)
          .includes(`not in ${user.name}'s collection`)
          ? { type: 'remove', success: false } // si el FunkoPop no fue encontrado, la operación no fue exitosa
          : { type: 'remove', success: true } // si el FunkoPop fue encontrado y eliminado, la operación fue exitosa
      return { type: 'remove', success: false } // si el parámetro funkoPop es undefined, la operación no fue exitosa
    }
  
    /**
     * Procesa la solicitud de búsqueda de un FunkoPop en la colección de un usuario.
     * @param user - Usuario al que pertenece la colección.
     * @param funkoPop - FunkoPop que se desea buscar.
     * @returns Objeto que indica si la operación fue exitosa o no, y opcionalmente los FunkoPops encontrados.
     */
    private processSearch = (
      user: User,
      funkoPop: FunkoPop | undefined
    ): ResponseType => {
      if (funkoPop)
        return user
          .searchFunko(funkoPop.id)
          .includes(`not in ${user.name}'s collection`)
          ? { type: 'search', success: false } // si el FunkoPop no fue encontrado, la operación no fue exitosa
          : { type: 'search', success: true, funkoPops: [funkoPop] } // si el FunkoPop fue encontrado, la operación fue exitosa y se devuelve en un arreglo
      return { type: 'search', success: false } // si el parámetro funkoPop es undefined, la operación no fue exitosa
    }
  
    /**
     * Procesa la solicitud de listar todos los FunkoPops de la colección de un usuario.
     * @param user - Usuario al que pertenece la colección.
     * @returns Objeto que indica si la operación fue exitosa o no, y opcionalmente los FunkoPops encontrados.
     */
    private processList = (user: User): ResponseType => {
      if (user.collection.length === 0) return { type: 'list', success: false } // si la colección del usuario está vacía, la operación no fue exitosa
      return { type: 'list', success: true, funkoPops: user.collection } // si la colección del usuario tiene elementos, la operación fue exitosa y se devuelve en un arreglo
    }
  
    /**
     * Detiene el servidor.
     */
    public stop(): void {
      this.server.close() // cierra el servidor
    }
  }
```

 Aquí utilizamos la biblioteca Node.js net para crear un servidor que maneja solicitudes JSON desde clientes y devuelve respuestas JSON. La clase ```FunkoApp``` es la encargada de procesar las solicitudes recibidas y realizar las operaciones correspondientes en la colección de FunkoPops del usuario. Las solicitudes se definen mediante tipos, que incluyen el tipo de operación a realizar, el usuario que hace la solicitud, la información del FunkoPop y un identificador de FunkoPop. Las respuestas también se definen mediante tipos y contienen el tipo de operación realizada, una indicación de si la operación se realizó con éxito y, en algunos casos, la información de los FunkoPops afectados.

 - ```Helpers.ts```:

```TypeScript
import chalk from 'chalk'
import yargs from 'yargs'
import { FunkoType } from '../Funko/Type.js'
import { FunkoGenre } from '../Funko/Genre.js'
import { FunkoPop } from '../Funko/FunkoPop.js'


/**
 * Función que verifica si el tipo de Funko es válido.
 * @param type Tipo de Funko.
 * @returns Devuelve `true` si el tipo es válido, `false` en caso contrario.
 */
export function checkType(type: string): boolean {
    if (Object.values(FunkoType).indexOf(type as FunkoType) === -1) {
      console.log(chalk.red('Invalid type')); // Imprime en consola un mensaje de error en rojo.
      return false;
    }
    return true;
  }
  
  /**
   * Función que verifica si el género de Funko es válido.
   * @param genre Género de Funko.
   * @returns Devuelve `true` si el género es válido, `false` en caso contrario.
   */
  export function checkGenre(genre: string): boolean {
    if (Object.values(FunkoGenre).indexOf(genre as FunkoGenre) === -1) {
      console.log(chalk.red('Invalid genre')); // Imprime en consola un mensaje de error en rojo.
      return false;
    }
    return true;
  }
  
  /**
   * Función que crea un nuevo FunkoPop a partir de los argumentos pasados en `argv`.
   * @param argv Argumentos desde la línea de comandos.
   * @returns Devuelve un nuevo objeto `FunkoPop`.
   */
  export function createFunko(argv: yargs.Arguments): FunkoPop {
    return new FunkoPop(
      argv.id as number,
      argv.name as string,
      argv.desc as string,
      argv.type as FunkoType,
      argv.genre as FunkoGenre,
      argv.brand as string,
      argv.brandId as number,
      argv.price as number
    );
  }
```

La función ```checkType``` verifica si el tipo de Funko es válido y devuelve true si es así, de lo contrario devuelve false. La función ```checkGenre``` hace lo mismo para el género. Ambas funciones imprimen un mensaje de error en la consola si el tipo o género son inválidos.

La función ```createFunko``` utiliza la biblioteca Yargs para analizar los argumentos pasados en la línea de comandos y crea un nuevo objeto FunkoPop utilizando los valores correspondientes de los argumentos. Luego devuelve el nuevo objeto FunkoPop.

- ```BasicFunkoPop.ts```:

```TypeScript
import { FunkoType } from './Type.js';
import { FunkoGenre } from './Genre.js';

/**
 * Interfaz para representar la información básica de un Funko Pop.
 */
export interface BasicFunkoPopInfo {
  /**
   * Identificador del Funko Pop.
   */
  id: number;

  /**
   * Nombre del Funko Pop.
   */
  name: string;

  /**
   * Descripción del Funko Pop.
   */
  description: string;

  /**
   * Tipo del Funko Pop.
   */
  type: FunkoType;

  /**
   * Género del Funko Pop.
   */
  genre: FunkoGenre;
}

/**
 * Clase abstracta que representa la información básica de un Funko Pop.
 * Esta clase implementa la interfaz BasicFunkoPopInfo.
 */
export abstract class BasicFunkoPop implements BasicFunkoPopInfo {
  /**
   * Constructor de la clase BasicFunkoPop.
   * @param id Identificador del Funko Pop.
   * @param name Nombre del Funko Pop.
   * @param description Descripción del Funko Pop.
   * @param type Tipo del Funko Pop.
   * @param genre Género del Funko Pop.
   */
  constructor(
    public readonly id: number,
    public name: string,
    public description: string,
    public type: FunkoType,
    public genre: FunkoGenre,
  ) {}
}
```

Se incluye una interfaz llamada ```BasicFunkoPopInfo``` y una clase abstracta llamada ```BasicFunkoPop``` que implementa esa interfaz. La interfaz define las propiedades de un Funko Pop, como el identificador, nombre, descripción, tipo y género. La clase ```BasicFunkoPop``` implementa estas propiedades y las inicializa a través de su constructor. La clase es abstracta, lo que significa que no se puede instanciar directamente, sino que debe ser extendida por otras clases que proporcionen la funcionalidad específica de cada Funko Pop.

- ```FunkoPop.ts```:

```TypeScript
import chalk from 'chalk';
import { BasicFunkoPop } from './BasicFunkoPop.js';
import { FunkoType } from './Type.js';
import { FunkoGenre } from './Genre.js';

/**
 * Interfaz que define la información básica de un FunkoPop
 * @interface
 */
export interface FunkoPopInfo {
  /** Marca del FunkoPop */
  brand: string;
  /** Identificador de la marca del FunkoPop */
  brandId: number;
  /** Precio de mercado del FunkoPop */
  marketPrice: number;
  /** Indica si el FunkoPop es exclusivo */
  exclusive: boolean;
  /** Información especial del FunkoPop */
  especial: string;
}

/**
 * Clase que representa un FunkoPop
 * @class
 */
export class FunkoPop extends BasicFunkoPop implements FunkoPopInfo {
  /**
   * Constructor de la clase FunkoPop
   * @constructor
   * @param {number} id - Identificador del FunkoPop
   * @param {string} name - Nombre del FunkoPop
   * @param {string} description - Descripción del FunkoPop
   * @param {FunkoType} type - Tipo del FunkoPop
   * @param {FunkoGenre} genre - Género del FunkoPop
   * @param {string} [brand=''] - Marca del FunkoPop
   * @param {number} [brandId=0] - Identificador de la marca del FunkoPop
   * @param {number} [marketPrice=0] - Precio de mercado del FunkoPop
   * @param {boolean} [exclusive=false] - Indica si el FunkoPop es exclusivo
   * @param {string} [especial=''] - Información especial del FunkoPop
   */
  constructor(
    id: number,
    name: string,
    description: string,
    type: FunkoType,
    genre: FunkoGenre,
    public brand = '',
    public brandId = 0,
    public marketPrice = 0,
    public exclusive = false,
    public especial: string = ''
  ) {
    super(id, name, description, type, genre);
  }

  /**
   * Método estático que imprime la información de un FunkoPop en la consola
   * @static
   * @param {FunkoPop} funko - FunkoPop que se desea imprimir en la consola
   * @returns {void}
   */
  public static print(funko: FunkoPop): void {
    console.table({
      id: funko.id,
      name: funko.name,
      description: funko.description,
      type: funko.type,
      genre: funko.genre,
      brand: funko.brand,
      brandId: funko.brandId,
      exclusive: funko.exclusive,
      especial: funko.especial,
    })
    if (funko.marketPrice < 10)
      console.log(chalk.greenBright(`Market Price: $${funko.marketPrice}`))
    else if (funko.marketPrice < 20)
      console.log(chalk.green(`Market Price: $${funko.marketPrice}`))
    else if (funko.marketPrice < 30)
      console.log(chalk.yellow(`Market Price: $${funko.marketPrice}`))
    else console.log(chalk.redBright(`Market Price: $${funko.marketPrice}`))
  }
}
```

Se define una clase llamada ```FunkoPop```, que representa un objeto FunkoPop y extiende otra clase llamada ```BasicFunkoPop```. La clase ```FunkoPop``` implementa una interfaz llamada ```FunkoPopInfo``` que define la información básica de un FunkoPop. La clase también tiene un constructor que acepta varios parámetros y un método estático llamado ```print``` que imprime la información del FunkoPop en la consola.

- ```Genre.ts```y ```Type.ts```:

```TypeScript
/**
 * Enumeración de géneros para figuras de Funko.
 * @enum
 */

export enum FunkoGenre {
  /** 
   * Animación 
   */
  ANIMATION = 'Animation',
  /** 
   * Anime 
   */
  ANIME = 'Anime',
  /** 
   * Películas y TV 
   */
  MOVIES_AND_TV = 'Movies and TV',
  /** 
   * Videojuegos 
   */
  VIDEO_GAMES = 'Video Games',
  /** 
   * Música 
   */
  MUSIC = 'Music',
  /** 
   * Cómics 
   */
  COMICS = 'Comics',
  /** 
   * Deportes
   */
  SPORTS = 'Sports',
}
```

```TypeScript
/**
 * Enumeración que representa los distintos tipos de funkos.
 * @enum
 */
export enum FunkoType {
  /**
   * Tipo de funko "Pop!"
   */
  POP = 'Pop!',
  /**
   * Tipo de funko "Pop! Black and White"
   */
  POP_BLACK_AND_WHITE = 'Pop! Black and White',
  /**
   * Tipo de funko "Pop! Glitter"
   */
  POP_GLITTER = 'Pop! Glitter',
  /**
   * Tipo de funko "Pop! Rides"
   */
  POP_RIDES = 'Pop! Rides',
  /**
   * Tipo de funko "Vynil Soda"
   */
  VYNIL_SODA = 'Vynil Soda',
  /**
   * Tipo de funko "Vynil Gold"
   */
  VYNIL_GOLDEN = 'Vynil Gold',
  /**
   * Tipo de funko "Pop! Keychain"
   */
  POP_KEYCHAIN = 'Pop! Keychain',
}
```

Para clasificar los funkos dependiendo de su tipo y género.

- ```user.ts```:

```TypeScript
import fs from 'fs';
import chalk from 'chalk';
import { FunkoPop } from '../Funko/FunkoPop.js';

/**
 * Interfaz que define los métodos y propiedades que debe tener un usuario.
 */
export interface UserInfo {
  /**
   * Nombre del usuario.
   */
  name: string;

  /**
   * Lista de Funko Pops de la colección del usuario.
   */
  collection: FunkoPop[];

  /**
   * Agrega un Funko Pop a la colección del usuario.
   * @param funkoPop Funko Pop a agregar a la colección.
   * @returns Un mensaje de éxito o error.
   */
  addFunko(funkoPop: FunkoPop): string;

  /**
   * Modifica un Funko Pop de la colección del usuario.
   * @param funkoPop Funko Pop modificado.
   * @returns Un mensaje de éxito o error.
   */
  updateFunko(funkoPop: FunkoPop): string;

  /**
   * Elimina un Funko Pop de la colección del usuario.
   * @param id ID del Funko Pop a eliminar.
   * @returns Un mensaje de éxito o error.
   */
  removeFunko(id: number): string;

  /**
   * Imprime en consola la lista de Funko Pops de la colección del usuario.
   */
  listFunkos(): void;

  /**
   * Busca un Funko Pop en la colección del usuario.
   * @param id ID del Funko Pop a buscar.
   * @returns Un mensaje de éxito o error.
   */
  searchFunko(id: number): string;

  /**
   * Guarda la colección del usuario en un archivo.
   */
  save(): void;

  /**
   * Carga la colección del usuario desde un archivo.
   */
  load(): void;
}

/**
 * Clase que implementa la interfaz UserInfo.
 */
export class User implements UserInfo {
  /**
   * Lista de Funko Pops de la colección del usuario.
   */
  public collection: FunkoPop[];

  /**
   * Crea un nuevo usuario.
   * @param name Nombre del usuario.
   * @param funkoPops Lista de Funko Pops para agregar a la colección del usuario.
   */
  constructor(public readonly name: string, ...funkoPops: FunkoPop[]) {
    this.collection = funkoPops;
  }

  /**
   * Agrega un Funko Pop a la colección del usuario.
   * @param funkoPop Funko Pop a agregar a la colección.
   * @returns Un mensaje de éxito o error.
   */
  public addFunko(funkoPop: FunkoPop): string {
    const notSameId = this.collection.filter((f) => f.id !== funkoPop.id);
    if (notSameId.length !== this.collection.length)
      return chalk.red(
        `Ya existe un Funko Pop con el ID ${funkoPop.id} en la colección de ${this.name}`
      );
    this.collection.push(funkoPop);
    return chalk.green(`${funkoPop.name} agregado a la colección de ${this.name}`);
  }

  /**
   * Actualiza un FunkoPop en la colección.
   * @param funkoPop - El FunkoPop a actualizar.
   * @returns Un mensaje indicando si se ha actualizado el FunkoPop o si no se ha encontrado en la colección.
   */
  public updateFunko(funkoPop: FunkoPop): string {
    const notSameId = this.collection.filter((f) => f.id !== funkoPop.id)
    if (notSameId.length === this.collection.length)
      return chalk.red(
        `Funko Pop with id ${funkoPop.id} not in ${this.name}'s collection`
      )
    this.collection = this.collection.map((f) =>
      f.id === funkoPop.id ? funkoPop : f
    )
    return chalk.green(
      `Funko Pop with id ${funkoPop.id} modified in ${this.name}'s collection`
    )
  }

  /**
   * Elimina un FunkoPop de la colección.
   * @param id - El ID del FunkoPop a eliminar.
   * @returns Un mensaje indicando si se ha eliminado el FunkoPop o si no se ha encontrado en la colección.
   */
  public removeFunko(id: number): string {
    const notSameId = this.collection.filter((f) => f.id !== id)
    if (notSameId.length === this.collection.length)
      return chalk.red(
        `Funko Pop with id ${id} not in ${this.name}'s collection`
      )
    this.collection = notSameId
    return chalk.green(
      `Funko Pop with id ${id} removed from ${this.name}'s collection`
    )
  }
  /**
   * Busca un FunkoPop en la colección.
   * @param id - El ID del FunkoPop a buscar.
   * @returns Un mensaje indicando si se ha encontrado el FunkoPop o si no se ha encontrado en la colección.
   */
  public searchFunko(id: number): string {
    const notSameId = this.collection.filter((f) => f.id !== id)
    if (notSameId.length === this.collection.length)
      return chalk.red(
        `Funko Pop with id ${id} not in ${this.name}'s collection`
      )

    const result = this.collection.find((f) => f.id === id)
    if (result) FunkoPop.print(result)
    return chalk.green(
      `Funko Pop with id ${id} found in ${this.name}'s collection`
    )
  }

  public listFunkos(): void {
    this.collection.forEach((funkoPop) => FunkoPop.print(funkoPop))
  }


  /** 
   * Carga la colección de Funko Pops.
   * Si no existe la carpeta de datos, la crea.
   * Si no existe la carpeta con el nombre de la colección, la crea.
   * Lee los archivos json de los Funko Pops de la colección y los añade a la colección.
   * @memberof FunkoPopCollection
   */
  public load(): void {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data'); // Crea la carpeta de datos si no existe
    const name = this.name.replace(/ /g, '_'); // Reemplaza espacios en blanco en el nombre de la colección con "_"
    if (!fs.existsSync(`./data/${name}`)) { // Crea la carpeta de la colección si no existe
      fs.mkdirSync(`./data/${name}`);
      return;
    }
    fs.readdirSync(`./data/${name}`).forEach((file) => { // Lee los archivos json de los Funko Pops de la carpeta de la colección
      if (file.match(/Funko-\d+.json/)) { // Selecciona solo los archivos que tienen un formato de nombre específico
        if (file !== undefined) {
          const fd = fs.readFileSync(`./data/${name}/${file}`, 'utf8');
          const funkoPop = JSON.parse(fd); // Parsea el contenido del archivo json en un objeto de FunkoPop
          this.collection.push(
            new FunkoPop(
              funkoPop.id,
              funkoPop.name,
              funkoPop.description,
              funkoPop.type,
              funkoPop.genre,
              funkoPop.brand,
              funkoPop.brandId,
              funkoPop.marketPrice,
              funkoPop.exclusive,
              funkoPop.especial
            )
          ); // Añade el objeto de FunkoPop a la colección
        }
      }
    });
  }

  /** 
   * Guarda la colección de Funko Pops.
   * Ordena la colección por id.
   * Reemplaza espacios en blanco en el nombre de la colección con "_".
   * Guarda cada Funko Pop de la colección en un archivo json en la carpeta de la colección.
   * @memberof FunkoPopCollection
   */
  public save(): void {
    this.collection.sort((a, b) => (a.id < b.id ? -1 : 1)); // Ordena la colección por id
    const name = this.name.replace(/ /g, '_'); // Reemplaza espacios en blanco en el nombre de la colección con "_"
    for (const funkoPop of this.collection) { // Itera por cada objeto de FunkoPop en la colección
      const data = JSON.stringify(funkoPop);
      fs.writeFileSync(`./data/${name}/Funko-${funkoPop.id}.json`, data); // Guarda cada FunkoPop en un archivo json con el formato de nombre específico en la carpeta de la colección
    }
  }
}
```

Por último se define una interfaz ```UserInfo``` que contiene los métodos y propiedades que debe tener un usuario, y una clase ```User``` que implementa la interfaz ```UserInfo```. La clase ```User``` contiene propiedades y métodos para administrar una colección de objetos FunkoPop, como agregar, actualizar, eliminar, buscar y listar Funko Pops, y guardar y cargar la colección desde un archivo. 

## Conclusiones

Además de utilizar las funcionalidades proporcionadas por Node, en esta práctica se ha hecho uso extensivo de TypeScript al igual que en las prácticas anteriores.

En cuanto a la programación asíncrona, esta es una forma de programación en la que el flujo de ejecución no se bloquea esperando que una operación se complete, sino que se continúa con otras operaciones y se utiliza un mecanismo de callback para manejar la finalización de la operación asíncrona.

Por lo tanto, esta práctica ha sido una buena oportunidad para aprender sobre las funcionalidades que ofrece Node, el uso de TypeScript y la programación asíncrona. Estos conceptos son fundamentales en el desarrollo de aplicaciones modernas y escalables, por lo que es importante tener un buen conocimiento de ellos para desarrollar software de calidad.



## Elementos Bibliográficos:

- Principios SOLID, https://profile.es/blog/principios-solid-desarrollo-software-calidad/.

- Guión de la Práctica 10, https://ull-esit-inf-dsi-2223.github.io/prct10-fs-proc-sockets-funko-app/ .

- Sobre un warning en particular de TypeDoc, https://github.com/TypeStrong/typedoc/issues/1739 .

- Adam Freeman - Essential TypeScript 4: From Beginner to ProURL,https://www.oreilly.com/library/view/essential-typescript-4/9781484270110/html/Part_1.xhtml .

- Basic writing and formatting syntax, https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax .




By:
```
EEEEEEEEEEEEEE   DDDDDDDDDDDDD         UUUUUUU       UUUUUUU
E::::::::::::E   D:::::::::::::D       U:::::U       U:::::U
E::::::::::::E   D:::::::::::::::D     U:::::U       U:::::U
EE:::::::EEEEE   DDD::::DDDDD:::::D    U:::::U       U:::::U
  E:::::E         D:::::D    D:::::D   U:::::U       U:::::U 
  E:::::E         D:::::D     D:::::D  U:::::U       U:::::U 
  E::::::EEEEEEE  D:::::D     D:::::D  U:::::U       U:::::U 
  E::::::::::::E  D:::::D     D:::::D  U:::::U       U:::::U 
  E::::::::::::E  D:::::D     D:::::D  U:::::U       U:::::U 
  E::::::EEEEEEE  D:::::D     D:::::D  U:::::U       U:::::U 
  E:::::E         D:::::D     D:::::D  U:::::U       U:::::U 
  E:::::E         D:::::D    D:::::D   U::::::U     U::::::U 
EE:::::::EEEEE   DDD::::DDDDD:::::D     U:::::::UUU:::::::U 
E::::::::::::E   D:::::::::::::::D       UU:::::::::::::UU  
E::::::::::::E   D:::::::::::::D           UU:::::::::UU    
EEEEEEEEEEEEEE   DDDDDDDDDDDDD               UUUUUUUUU  
```