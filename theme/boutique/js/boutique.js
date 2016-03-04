blocksConfig.footer={
    "template": "/templates/blocks/footer.html"
};
blocksConfig.footer_links={
    "template": "/templates/blocks/footer_links.html"
};
blocksConfig.productList={
    "template": "/templates/blocks/productList.html",
    "internalDependencies":["/src/modules/rubedoBlocks/controllers/ProductListController.js","/src/modules/rubedoBlocks/directives/PaginatorDirective.js"],
    "externalDependencies":['/components/OwlFonk/OwlCarousel/owl-carousel/owl.carousel.min.js']
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
