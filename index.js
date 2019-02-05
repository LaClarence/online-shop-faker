const axios = require("axios");
const faker = require("faker");

const url = "https://flejne-shop.herokuapp.com";
const max_dep = 1;
const max_cat = 1;
const max_prod = 2;
const max_rev = 3;
const max_retry = 10;

const fakeRating = () => {
  return Math.floor(Math.random() * 5);
};

const chooseFake = (apiMethod, min, max, alternate) => {
  for (let r = 0; r < max_retry; r++) {
    const proposal = apiMethod();
    if (proposal.length >= min && proposal.length <= max) {
      return proposal;
    }
  }
  console.err("Failed to find fake according to constraint given...");
  return alternate;
};

const fakeDepartment = () =>
  chooseFake(faker.commerce.department, 3, 20, "Departement");

const fakeCategory = () =>
  chooseFake(faker.commerce.product, 5, 15, "Category");

const fakeProduct = () =>
  chooseFake(faker.commerce.productName, 5, 25, "Product");

const fakeUsername = () => chooseFake(faker.name.firstName, 5, 25, "Username");

const addAll = async () => {
  try {
    for (let di = 0; di < max_dep; di++) {
      const department = fakeDepartment();
      console.log(`Add department: ${department}`);

      const depResponse = await axios.post(url + "/department/create", {
        title: department
      });
      // No need to check status 200/400. When 400 an exeption is raised.
      const depId = depResponse.data._id;
      for (let ci = 0; ci < max_cat; ci++) {
        const category = fakeCategory();
        console.log(`Add category: ${category}`);
        const catResponse = await axios.post(url + "/category/create", {
          title: category,
          department: depId
        });
        const catId = catResponse.data._id;
        for (let pi = 0; pi < max_prod; pi++) {
          const productName = fakeProduct();
          const productPrice = faker.commerce.price();
          console.log(
            `Add product name ${productName} with price ${productPrice}`
          );
          const prodResponse = await axios.post(url + "/product/create", {
            title: productName,
            description: "Fake description",
            price: productPrice,
            category: catId
          });
          const prodId = prodResponse.data._id;
          console.log(`Add review for product ${prodId}`);
          for (let ri = 0; ri < max_rev; ri++) {
            console.log("Review creation with Product Id: ", prodId);
            const revResponse = await axios.post(url + "/review/create", {
              product: prodId,
              rating: fakeRating(),
              comment: "My comment",
              username: fakeUsername()
            });
          }
        }
      }
    }
    return true;
  } catch (error) {
    console.log("Error: ", error);
  }
};

console.log(`Seed db using API ${url}`);
addAll();
