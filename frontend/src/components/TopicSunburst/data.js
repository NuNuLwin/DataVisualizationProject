// constants
const TOPIC_API_URL = "https://api.openalex.org/topics";
const ORIGINAL_ID_DOMAIN = "openalex.org";
const NEW_ID_DOMAIN = "api.openalex.org";
const WAIT_TS = 1000;
const PER_PAGE = 100;

// helpers
const replaceId = (id) => id.replace(ORIGINAL_ID_DOMAIN, NEW_ID_DOMAIN);

const callAPI = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const getTopics = async () => {
  const countObj = await callAPI(TOPIC_API_URL);
  const count = countObj.meta.count;
  const pageCount =
    count % PER_PAGE > 0 ? Math.floor(count / PER_PAGE) + 1 : count / PER_PAGE;

  console.log("PAGE COUNT:", pageCount);

  let topics = [];
  for (let i = 1; i < pageCount + 1; i++) {
    console.log(`Calling Topics API Page: ${i}`);
    let objects = await callAPI(`${TOPIC_API_URL}?page=${i}`);
    objects = objects.results.map((obj) => {
      return {
        id: obj.id,
        name: obj.display_name,
        subfield: obj.subfield.display_name,
        field: obj.field.display_name,
        domain: obj.domain.display_name,
        value: obj.works_count,
      };
    });
    topics = topics.concat(objects);
    await new Promise((r) => setTimeout(r, WAIT_TS));
  }
  return topics;
};

const getJSONData = async () => {
  let domains = [];
  let topics = await getTopics();

  for (let i = 0; i < topics.length; i++) {
    // console.log(topics[i])
    // Domain Level
    let domainIndex = domains.findIndex((d) => d.name === topics[i].domain);
    if (domainIndex === -1) {
      domains.push({
        name: topics[i].domain,
        children: [], // fields
      });
      domainIndex = domains.length - 1;
    }
    let domain = domains[domainIndex];

    // Field level
    let fieldIndex = domain.children.findIndex(
      (c) => c.name === topics[i].field
    );
    if (fieldIndex === -1) {
      domain.children.push({
        name: topics[i].field,
        children: [], // sub fields
      });
      fieldIndex = domain.children.length - 1;
    }
    let field = domain.children[fieldIndex];

    // Sub Field level
    let subFieldIndex = field.children.findIndex(
      (c) => c.name === topics[i].subfield
    );
    if (subFieldIndex === -1) {
      field.children.push({
        name: topics[i].subfield,
        children: [], // topics
      });
      subFieldIndex = field.children.length - 1;
    }
    let subField = field.children[subFieldIndex];

    // Topics Level
    let topicIndex = subField.children.findIndex(
      (c) => c.name === topics[i].name
    );
    if (topicIndex === -1) {
      subField.children.push({
        id: topics[i].id,
        name: topics[i].name,
        value: topics[i].value,
      });
      topicIndex = subField.children.length - 1;
    }
    let topicField = subField.children[topicIndex];

    domains[domainIndex] = domain;
  }

  let mainData = {
    name: "Science",
    children: domains,
  };
  let fs = require("fs");
  fs.writeFile(`sunburst_data.json`, JSON.stringify(mainData), function (err) {
    if (err) {
      console.log(err);
    }
  });

  //   for (let i = 0; i < domains.length; i++) {
  //     fs.writeFile(
  //       `${domains[i].name}.json`,
  //       JSON.stringify(domains[i]),
  //       function (err) {
  //         if (err) {
  //           console.log(err);
  //         }
  //       }
  //     );
  //   }
};

getJSONData();
