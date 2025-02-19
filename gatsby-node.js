// const webpack = require("webpack");
const _ = require("lodash");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");
const Promise = require("bluebird");

const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode });
    const fileNode = getNode(node.parent);
    const source = fileNode.sourceInstanceName;
    const separatorIndex = slug.indexOf("---") >= 0 ? slug.indexOf("---") : null;
    const shortSlugStart = separatorIndex > 0 ? separatorIndex + 3 : 0;

    createNodeField({
      node,
      name: `slug`,
      value: `${separatorIndex ? "/" : ""}${slug.substring(shortSlugStart)}`
    });
    createNodeField({
      node,
      name: `prefix`,
      value: separatorIndex ? slug.substring(1, separatorIndex) : ""
    });
    createNodeField({
      node,
      name: `source`,
      value: source
    });
  }
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    const postTemplate = path.resolve("./src/templates/PostTemplate.js");
    const pageTemplate = path.resolve("./src/templates/PageTemplate.js");
    const workTemplate = path.resolve("./src/templates/WorkTemplate.js");
    const categoryTemplate = path.resolve("./src/templates/CategoryTemplate.js");
    resolve(
      graphql(
        `
          {
            allMarkdownRemark(
              filter: { fields: { slug: { ne: null } } }
              sort: { fields: [fields___prefix], order: DESC }
              limit: 1000
            ) {
              edges {
                node {
                  id
                  fields {
                    slug
                    prefix(formatString: "D MMMM YYYY")
                    source
                  }
                  frontmatter {
                    title
                    category
                  }
                }
              }
            }
          }
        `
      ).then((result) => {
        if (result.errors) {
          console.log(result.errors);
          reject(result.errors);
        }

        console.log(result);

        const items = result.data.allMarkdownRemark.edges;

        // Create home page
        createPage({
          path: "/",
          component: path.resolve("./src/templates/index.js")
        });

        // Create category list
        const categorySet = new Set();
        items.forEach((edge) => {
          const {
            node: {
              frontmatter: { category }
            }
          } = edge;

          if (category && category !== null) {
            categorySet.add(category);
          }
        });

        // Create category pages
        const categoryList = Array.from(categorySet);
        categoryList.forEach((category) => {
          createPage({
            path: `/category/${_.kebabCase(category)}/`,
            component: categoryTemplate,
            context: {
              category
            }
          });
        });

        // Create posts
        const posts = items.filter((item) => item.node.fields.source === "posts");
        posts.forEach(({ node }, index) => {
          const slug = node.fields.slug;
          const next = index === 0 ? undefined : posts[index - 1].node;
          const prev = index === posts.length - 1 ? undefined : posts[index + 1].node;
          const source = node.fields.source;

          createPage({
            path: slug,
            component: postTemplate,
            context: {
              slug,
              prev,
              next,
              source
            }
          });
        });

        // pages
        const pages = items.filter((item) => item.node.fields.source === "pages");
        pages.forEach(({ node }) => {
          const slug = node.fields.slug;
          const source = node.fields.source;

          createPage({
            path: slug,
            component: pageTemplate,
            context: {
              slug,
              source
            }
          });
        });

        // work
        const work = items.filter((item) => item.node.fields.source === "work");
        work.forEach(({ node }) => {
          const slug = node.fields.slug;
          const source = node.fields.source;

          createPage({
            path: slug,
            component: workTemplate,
            context: {
              slug,
              source
            }
          });
        });

        // Create blog post list pages
        const postsPerPage = 5;
        const numPages = Math.ceil(posts.length / postsPerPage);

        _.times(numPages, (i) => {
          createPage({
            path: i === 0 ? `/blog` : `/blog/${i + 1}`,
            component: path.resolve("./src/templates/BlogTemplate.js"),
            context: {
              limit: postsPerPage,
              skip: i * postsPerPage,
              numPages,
              currentPage: i + 1
            }
          });
        });
      })
    );
  });
};

exports.onCreateWebpackConfig = ({ stage, actions }, options) => {
  switch (stage) {
    case `build-javascript`:
      actions.setWebpackConfig({
        plugins: [
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: "./report/treemap.html",
            openAnalyzer: true,
            logLevel: "error",
            defaultSizes: "gzip"
          })
        ]
      });
  }
};
