blocksConfig.footer={
    "template": "/templates/blocks/footer.html"
};
blocksConfig.footer_links={
    "template": "/templates/blocks/footer_links.html"
};
//blocksConfig.navigation={
//  "template":  "/templates/blocks/navigation.html",
//  "internalDependencies":["/src/modules/rubedoBlocks/controllers/MenuController.js","/src/modules/rubedoBlocks/controllers/ShoppingCartController.js"],
//};
blocksConfig.boutiqueTop={
  "template":  "/templates/blocks/boutiqueTop.html",
  "internalDependencies":["/src/modules/rubedoBlocks/controllers/SearchFormController.js",
      "/src/modules/rubedoBlocks/controllers/ShoppingCartController.js",
      "/src/modules/rubedoBlocks/controllers/ImageController.js",
      "/src/modules/rubedoBlocks/controllers/AuthenticationController.js",
  ],
};

