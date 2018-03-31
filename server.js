const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const moment = require("moment");
const later = require("later");
const chalk = require("chalk");
const cache = require("memory-cache");

const Sequelize = require("sequelize");

const scrape = require("./lib/scraper.js");
const models = require("./models");

const fs = require("fs");
Log = require("log");
log = new Log("info");

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

const Op = Sequelize.Op;

app.use(express.static(__dirname + "/public"));

cache.put("cache", {});

io.on("connection", function(socket) {
  const address = socket.handshake.address;
  if (address) {
    if (Object.keys(cache.get("cache")).length > 1) {
      socket.emit("newdata", cache.get("cache"));
    }
  }
  log.info(chalk.green(`A user with IP ${address} connected`));
  socket.on("disconnect", () =>
    log.info(chalk.yellow(`User ${address} disconnected`))
  );

  socket.on("pick date", data => {
    let date = data.date;
    const day = moment(date).format("DD");
    const month = moment(date).format("MM");
    const year = moment(date).format("YYYY");

    date = year + "-" + month + "-" + day;
    models.data
      .findAll({
        where: {
          day: {
            [Op.like]: date
          }
        }
      })
      .then(dbdata => socket.emit("data from sqlite", { data: dbdata }))
      .catch(err => console.log(err));
  });

  var textSched = later.parse.text("every 10 min");
  later.setInterval(() => {
    scrape
      .get()
      .then(result => {
        const newdata = result[0];
        var newCache = new cache.Cache();
        newCache.put("cache", newdata);
        if (newCache.get("cache") != cache.get("cache")) {
          socket.emit("newdata", newdata);
          cache.put("cache", newCache.get("cache"));
          const magnitude = parseFloat(newdata.magnitude);
          if (magnitude > 6) {
            log.info(
              chalk.red(
                "Earthquake tracked at %s with magnitude %s",
                newdata.location,
                magnitude
              )
            );
          } else {
            log.info(
              "Earthquake tracked at %s with magnitude %s",
              newdata.location,
              newdata.magnitude
            );
          }
        }
      })
      .catch(err => console.log(err));
  }, textSched);
});

module.exports = { app: app, server: server };
