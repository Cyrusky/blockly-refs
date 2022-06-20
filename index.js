/**
 * File: index.js
 * Path: /index.js
 * Created Date: 2022-06-20  22:51:20 pm
 * Author: Bo.Jin (bo.jin@borgor.cn)
 * -----
 * Last Modified: Bo.Jin (bo.jin@borgor.cn)
 * Modified By: 2022-06-20 23:25:11 pm
 * ------------------------------------
 * Copyright (c) 2022 BorGor.cn
 * ------------------------------------
 */
let fs = require("fs");
const path = require("path");

const nodes = {};
const links = [];
const refTimes = {};

function listFile(dir, list = []) {
  var arr = fs.readdirSync(dir);
  arr.forEach((item) => {
    var fullpath = path.join(dir, item);
    var stats = fs.statSync(fullpath);
    if (stats.isDirectory()) {
      listFile(fullpath, list);
    } else {
      if (fullpath.endsWith(".js") && fullpath.indexOf("compressed") === -1) {
        list.push(fullpath);
      }
    }
  });
  return list;
}

const dir_name = path.resolve(__dirname, "sourcecode");

const res = listFile(dir_name);

res.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  let match = /goog\.module\(\'([a-zA-Z0-9\.]+)\'\);/.exec(content);
  if (match) {
    const moduleName = match[1];
    nodes[moduleName] = { id: moduleName, group: 1 };
    refTimes[moduleName] = refTimes[moduleName] || 0;
    const contentRequire = fs.readFileSync(filePath, "utf-8");
    let matchRequire = contentRequire.match(
      /goog\.require\(\'([a-zA-Z0-9\.]+)\'\);/g
    );
    if (matchRequire && matchRequire.length > 0) {
      matchRequire.forEach((t) => {
        let moduleRequiredName = t
          .replace("goog.require('", "")
          .replace("');", "");
        refTimes[moduleName] = refTimes[moduleName]
          ? refTimes[moduleName] + 1
          : 1;
        links.push({
          source: moduleName,
          target: moduleRequiredName,
          value: 0,
        });
      });
    }
  }
});
links.forEach((link) => {
  link.value = refTimes[link.source];
});
// const pathInfo =
//   "/Users/ck/Documents/projects/Learning/blockly/sourcecode/core/flyout_button.js";

// const content = fs.readFileSync(pathInfo, "utf-8");
// let match = content.match(/goog\.require\(\'([a-zA-Z0-9\.]+)\'\);/g);
// console.log(match);

fs.writeFileSync(
  "database.json",
  JSON.stringify(
    {
      nodes: Object.values(nodes),
      links: links,
    },
    " ",
    2
  )
);
