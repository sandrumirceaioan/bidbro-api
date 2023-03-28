import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require("path");
const nodemailer = require("nodemailer");

@Injectable()
export class SharedService {
    private mailGun: any;

    constructor(
        private configService: ConfigService
    ) {
        this.mailGun = {
            key: this.configService.get('MAILGUN_API_KEY'),
            domain: this.configService.get('MAILGUN_DOMAIN'),
            sender: `mailgun@${this.configService.get('MAILGUN_DOMAIN')}`
        }

    }

    public validateOptions(options) {
        return {
            limit: options && options.limit || null,
            skip: options && options.skip || 0,
            sort: options && options.sort || {},
            select: options && options.select || '',
            upsert: options && options.upsert || false,
            new: options && options.new || true
        }
    }

    checkParam(param) {
        if (!param) {
            throw new HttpException(`${param} is required`, HttpStatus.BAD_REQUEST)
        }
    }


    public async sendMail(recipient, token): Promise<any> {
        const env = this.configService.get('ENVIRONMENT');
        if (env === 'dev') {
            console.log('DEV ENV');
            console.log(__dirname);
            const source = fs.readFileSync(path.resolve(__dirname, '../../../../assets/templates/reset-password.template.hbs'), 'utf8');
            const template = Handlebars.compile(source);
            const resetTemplate = template({
                "logoImg": `${this.configService.get('API_URL')}/ctf-logo-white-medium.png`,
                "resetUrl": `${this.configService.get('APP_URL')}/auth/reset/${token}`,
                "appUrl": this.configService.get('APP_URL')
            });

            const mailgun = new Mailgun(formData);
            const client = mailgun.client({ username: 'api', key: this.mailGun.key, url: `https://api.mailgun.net` });


            const messageData = {
                from: `CTF APP ${this.mailGun.sender}`,
                to: `${recipient}`,
                subject: "Reset password",
                text: "Use generated token below to reset your password",
                html: resetTemplate
            };

            return client.messages.create(this.mailGun.domain, messageData);
        } else if (env === 'prod') {
            console.log('PROD ENV');
            const source = `
            <!doctype html>
            <html lang="ro">

            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <title>Reset Password Email Template</title>
                <meta name="description" content="Reset Password Email Template.">
                <style type="text/css">
                    a:hover {
                        text-decoration: underline !important;
                    }
                </style>
            </head>

            <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                <!--100% body table-->
                <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                    <tr>
                        <td>
                            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="text-align:center; background-color: #1C0E5C; height: 100px; padding: 15px; border-radius:10px;">
                                        <a href="{{appUrl}}" title="logo" target="_blank">CTF</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                                            style="max-width:670px;background:#fff; border-radius:10px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:0 35px;">
                                                    <h3
                                                        style="color:#1e1e2d; font-weight:500; margin:0;font-family:'Rubik',sans-serif;">
                                                        Resetare parola</h3>
                                                    <span
                                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>

                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Am generat un link unic pentru resetarea parolei.</p>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        Click <a href="{{resetUrl}}"
                                                        style="background:#df8613;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px; cursor:pointer;">
                                                        aici</a> pentru a reseta parola.
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="text-align:center;">
                                        <p
                                            style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                                            &copy; <strong>www.ctf.ro</strong></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!--/100% body table-->
            </body>

            </html>
            `;
            const template = Handlebars.compile(source);
            const resetTemplate = template({
                "logoImg": `${this.configService.get('HEROKU_APP_LOGO')}`,
                "resetUrl": `${this.configService.get('APP_URL')}/auth/reset/${token}`,
                "appUrl": this.configService.get('APP_URL')
            });

            const mailgun = new Mailgun(formData);
            const client = mailgun.client({ username: 'api', key: this.mailGun.key, url: `https://api.mailgun.net` });


            const messageData = {
                from: `CTF APP ${this.mailGun.sender}`,
                to: `${recipient}`,
                subject: "Reset password",
                text: "Use generated token below to reset your password",
                html: resetTemplate
            };

            return client.messages.create(this.mailGun.domain, messageData);

        }


    }

}
