#!/usr/bin/env node

const express = require("express");
const fs = require('fs');
const mustache = require("mustache");

module.exports = class Flavour {
  constructor(config) {
    this.app = express();
    this.config = config;
    this.server = this.app.listen(3000, function(){
      console.log("Node.js is listening to PORT:" + this.address().port);
      console.log();
    });
    const vars = this;
    this.app.get("/", function(req, res){
      const template = fs.readFileSync("pages/index.html");
      //res.writeHead(200, {"Content-Type": "text/html"});
      Flavour.render(res, template, { ...vars });
    });
  }

  static render(res, tmp, vars) {
    res.send(mustache.render(tmp.toString(), { ...res, ...vars }));
  }
}
