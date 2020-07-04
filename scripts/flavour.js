#!/usr/bin/env node

const express = require("express");

module.exports = class Flavour {
  constructor(config) {
    this.app = express();
    this.server = this.app.listen(3000, function(){
      console.log("Node.js is listening to PORT:" + this.address().port);
      console.log();
    });    
    this.app.get("/", function(req, res, next){
      res.json(config.title);
    });
  }
}
