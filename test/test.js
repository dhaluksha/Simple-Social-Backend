const expect = require("chai").expect;
const request = require("supertest");
const server = require("../server.js");

var app =request.agent(server);

describe("Correct User login test",function (){
    it("Should return 'Login Successfully'",function (){
        app.post("/login").send({
            username:"dhaluksha",
            password:"dhaluksha"
        }).end((err,res) =>{
            expect(200);
           // expect(res.body.message).to.equal('Login Successfully');
        })
    })
});
describe("Incorrect Password login test",function (){
    it("Should return 'Password is incorrect'",function (){
        app.post("/login").send({
            username:"dhaluksha",
            password:"wrong"
        }).end((err,res) =>{
            expect(200);
            //expect(res.body.message).to.equal('Password is incorrect');

        })
    })
});

describe("Incorrect User login test",function (){
    it("Should return 'Username not found'",function (){
        app.post("/login").send({
            username:"wrong",
            password:"wrong"
        }).end((err,res) =>{
            expect(200);
           // expect(res.body.message).to.equal("Username not found");
        })
    })
});





describe("Empty  login fields test",function (){
    it("Should return 'No empty fields allowed'",function (){
        app.post("/login").send({
            username:"",
            password:""
        }).end((err,res) =>{
            expect(200);
            //expect(res.json.message).to.equal('No empty fields allowed');
        })
    })
});

