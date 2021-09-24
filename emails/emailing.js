/*
? SEND BROADCAST EMAIL
? RETURN ARRAY OF ALL EMAILS
*/

const { MongoClient } = require('mongodb');
const nodemailer = require("nodemailer");
const fs = require('fs');

const uri = 'mongodb+srv://oestrangeiro:oestrangeiroadminpass@cluster0.suozx.mongodb.net/OEstrangeiro?retryWrites=true&w=majority'
const client = new MongoClient(uri)
const users = client.db('OEstrangeiro').collection('users')

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "oestrangeirobympm@gmail.com",
      pass: "Oestrangeiro2021",
    },
});

module.exports = class EMAIL { 

    getHTMLContent(templateName) {
        return fs.readFileSync(__dirname + '/templates/' + templateName + '.html', 'utf8')
    }
    setHTMLContent(templateName, content) {
        return fs.writeFileSync(__dirname + '/templates/' + templateName + '.html', content)
    }

    async getAllEmails(admin) {
        await client.connect()
        return users.find({}).toArray().then(users => {
            var emails = []
            for (let user of users) {
                if (admin === "false") {
                    emails.push(user.email)
                }
                if (admin === "true" && user.admin === true) {    
                    emails.push(user.email)
                } 
            }
            client.close()
            return emails
        })
    }

    async broadcastEmail({admin=false, subject, content='', html=''}) {
        var targets = await this.getAllEmails(admin)
        let send = await transporter.sendMail({
            from: '"O Estrangeiro" "<oestrangeirobympm@gmail.com>"',
            bcc: targets, // List of receivers
            subject: subject, 
            text: content, 
            html: html,
        })
        return send.response.includes('OK') ? "Email sent successfuly!" : "Could not send email"
    }

    async sendWelcomeEmail(target) {
        return transporter.sendMail({
            from: '"O Estrangeiro" "<oestrangeirobympm@gmail.com>"',
            to: target,
            subject: "Bem Vindo ao 'O Estrangeiro'", 
            html: this.getHTMLContent('welcome')
        })
    }

    async registerNewEmail(email) {
        if (email.includes('@') && email.includes('.')) {
            await client.connect()
            let exists = await users.findOne({ 'email': email})
            if (exists === null) {
                await users.insertOne({
                    'email': email
                })
                let exists = await users.findOne({
                    'email': email
                })
                if (exists) {
                    this.sendWelcomeEmail(email)
                    this.broadcastEmail({
                        admin: "true",
                        subject: "O Estrangeiro | Nova Subscrição",
                        content: `Novo Utilizador Registado: '${email}'`
                    })
                    return "Obrigado por fazer parte deste projeto!"
                } else {
                    return "Não foi possível registar o teu endereço"
                }
            } else {
                // Already Exists
                return "Esse endereço já se encontra registado!"
            }
        } else {
            return "Endereço de email inválido!"
        }
    }
}