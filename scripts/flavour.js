#!/usr/bin/env node

const express = require('express');
const fs = require('fs');
const mustache = require('mustache');
const { Sequelize } = require('sequelize');

module.exports = class Flavour {
  constructor(config) {
    this.app = express();
    this.config = config;
    this.server = this.app.listen(process.env.PORT || 3000, function () {
      console.log('Flavour is listening to PORT:' + this.address().port);
    });
    const vars = this;
    const sequelize = new Sequelize('postgres:/root:password@localhost:5432/root');
    this.connect(sequelize);

    this.app.use('/assets', express.static('assets'));
    this.app.get('/', function (req, res) {
      const template = fs.readFileSync('pages/index.html');
      Flavour.render(res, template, { ...vars });
    });
  }

  async connect(sequelize) {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }

  static render(res, tmp, vars) {
    const pageTemplate = mustache.render(tmp.toString(), { ...res, ...vars });
    const appTemplate = fs.readFileSync('pages/app.html');
    const renderTemplate = mustache.render(appTemplate.toString(), { ...res, ...vars, main: pageTemplate });
    res.send(renderTemplate);
  }
};
