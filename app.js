#!/usr/bin/env node
const ip = require("ip");
const dns = require("dns");
const geoip = require("geoip-lite");

function isIp(ipAddress) {
  return ip.isV4Format(ipAddress) || ip.isV6Format(ipAddress);
}

async function lookupIpByDomain(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, _family) => {
      if (err) reject(err);
      resolve(address);
    });
  });
}

async function lookupDomainByIp(ip) {
  return new Promise((resolve, _reject) => {
    dns.reverse(ip, (err, domains) => {
      if (err) resolve([]);
      resolve(domains);
    });
  });
}

(async () => {
  if (process.argv.length !== 3) {
    console.error("Usage: node app.js <domain|ip>");
    process.exit(1);
  }

  let ipAddress = "";
  let domains = [];

  try {
    if (isIp(process.argv[2])) {
      ipAddress = process.argv[2];
      domains = await lookupDomainByIp(ipAddress);
    } else {
      ipAddress = await lookupIpByDomain(process.argv[2]);
      domains = [process.argv[2], ...(await lookupDomainByIp(ipAddress))];
    }
    geoip.reloadDataSync();
    const geo = geoip.lookup(ipAddress);

    console.log(`IP: ${ipAddress}`);
    console.log(`Domains: ${domains.join(", ")}`);
    console.table(geo);
  } catch (err) {
    console.error(err);
  }
})();
