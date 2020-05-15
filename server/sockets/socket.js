const { io } = require('../server');
const {Usuarios} = require('../classes/usuario');
const {crearMensaje} = require('../include/include');
const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
        if(!data.nombre || !data.sala){
            return callback({
                success: false,
                message: 'El nombre o sala es necesario'
            });
        }
        client.join(data.sala);
        //let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);
        usuarios.agregarPersona(client.id, data.nombre, data.sala);
        //client.broadcast.emit('listaPersonas', usuarios.getPersonas());
        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));
        //callback(personas);
        callback(usuarios.getPersonasPorSala(data.sala));
        //console.log(usuario);
    }); 

    client.on('crearMensaje', (data) => {
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        //client.broadcast.emit('crearMensaje', mensaje);
        client.broadcast.to(data.sala).emit('crearMensaje', mensaje);
    });

    client.on('disconnect', ()=>{
        let personaBorrada = usuarios.borrarPersona(client.id);
        if(personaBorrada != 'undefined'){
            //client.broadcast.emit('crearMensaje',crearMensaje('Administrador',`${ personaBorrada.nombre } abandona el Chat.`));
            //client.broadcast.emit('listaPersonas', usuarios.getPersonas());
            client.broadcast.to(personaBorrada.sala).emit('crearMensaje',crearMensaje('Administrador',`${ personaBorrada.nombre } abandona el Chat.`));
            client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));
        }
    });

    // mensajes privados
    client.on('mensajePrivado', (data) => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.mensaje, data.mensaje));
    });

});