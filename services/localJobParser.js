function extractBasic(text){

const data = {};

if(text.includes("@")) {
  data.contact = text.match(/\S+@\S+\.\S+/)?.[0];
}

const salary = text.match(/\d{3,}/);
if(salary) data.salary = salary[0];

return data;
}

module.exports = { extractBasic };
