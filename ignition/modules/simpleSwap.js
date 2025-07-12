const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const SimpleSwap = buildModule("SimpleSwap", (dev) => {
  const simpleSwap = dev.contract("SimpleSwap");

  return { simpleSwap };
});

module.exports = SimpleSwap;