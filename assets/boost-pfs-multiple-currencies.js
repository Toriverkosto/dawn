function getExtrasProductDataByAjax(data, templateName, callback, numberProductPerAjaxCall, ajaxPage, allAjaxData) {
  if (!ajaxPage) ajaxPage = 0;
  if (!allAjaxData) allAjaxData = [];

  // We can only get 20 products per ajax call, if there are more than 20 products per page, we need to call multiple times
  if (!numberProductPerAjaxCall || numberProductPerAjaxCall > 20){
    numberProductPerAjaxCall = 20;
  }
  var fromIndex = numberProductPerAjaxCall * ajaxPage;
  var toIndex = Math.min(data.length, numberProductPerAjaxCall * (ajaxPage + 1));
  var handles = [];
  for (var i = fromIndex; i < toIndex; i++) {
    handles.push(data[i].handle);
  }
  var handleString = handles.join("+");
	
	var url = Utils.buildProductItemUrl({handle: 'test' }, true);
  if (url.includes('/collections//products'))  url = url.replace('/collections//products', '/collections/all/products');
  url = url.split('/products/')[0]
  
  if (!url.includes('collection')) {
    url += '/collections/all'
  } 
  
  var itemDataUrl = url + "/" + handleString + "?view=" + templateName;

  jQ.ajax({
    type: "GET",
    url: itemDataUrl,
    success: function(ajaxData) {
      // the same call as buildExtrasProductListByAjax, with one extra params: ajaxData (the new data we just got from ajax call)
      onGetExtrasProductDataByAjaxSuccess(data, templateName, callback, numberProductPerAjaxCall, ajaxPage, ajaxData, allAjaxData);
    }
  });
}

function onGetExtrasProductDataByAjaxSuccess(data, templateName, callback, numberProductPerAjaxCall, ajaxPage, ajaxData, allAjaxData) {
  // Try to parse the json we get from collection endpoint
  try {
    if(/<\!--.*?-->/.test(ajaxData)){
      ajaxData = ajaxData.replace(/<\!--.*?-->/g, '');
    }
    // Add the new data to the "all data" list
    allAjaxData = allAjaxData.concat(JSON.parse(ajaxData).products);
  } catch (error) {
    console.error('Could not parse json from ' + templateName + ": " + error.message);
  }

  // We can only get 20 products per ajax call, if there are more than 20 products per page, we need to call multiple times
  var fromIndex = numberProductPerAjaxCall * ajaxPage;
  if (fromIndex < data.length - 1) {
    ajaxPage++;
    getExtrasProductDataByAjax(data, templateName, callback, numberProductPerAjaxCall, ajaxPage, allAjaxData);
  } else {
    // After getting all products from all pages, call the callback function
    if (typeof callback == 'function') {
      callback(allAjaxData);
    }
  }
}

var currency = boostPFSConfig.general.current_currency.toLowerCase();

function getNewPrices(apiData, productsData) {
  const result = {...apiData, products: [...apiData.products]};
  
  productsData.forEach(function(product) {
    var apiProducts = result.products.filter(function(apiProduct) { return apiProduct.id === product.id });
    if (apiProducts.length > 0) {
      for (var apiProduct of apiProducts) {
        apiProduct.compare_at_price_min = product.compare_at_price_min / 100
        apiProduct.price_min = product.price_min / 100
        apiProduct.price_max = product.price_max / 100
  
        apiProduct['compare_at_price_min_' + currency] = product.compare_at_price_min / 100
        apiProduct['price_min_' + currency] = product.price_min / 100
        apiProduct['price_max_' + currency] = product.price_max / 100
  
        for (var variant of product.variants) {
          var vidx = apiProduct.variants.findIndex(v => v.id === variant.id);
          if (vidx === -1) continue;
          
          apiProduct.variants[vidx].price = variant.price / 100;
          apiProduct.variants[vidx].compare_at_price = variant.compare_at_price / 100;
        }
      }
    }          
  });

  return result;
}

if (typeof FilterApi !== 'undefined') {
  FilterApi.afterCallAsync = function(result, callbackFilterApi) {          
    if (!result.products || result.products.length === 0) { 
      callbackFilterApi(result);
      return;
    }

    getExtrasProductDataByAjax(result.products, "boost-multiple-currencies", function(productsData) {
      callbackFilterApi(getNewPrices(result, productsData));
    });
  }
}

if (typeof InstantSearchApi !== 'undefined') {
	InstantSearchApi.afterCallAsync = function(result, callbackInstantSearchApi) {
	  var currency = boostPFSConfig.general.current_currency.toLowerCase();
	  
	  if (!result.products || result.products.length === 0) {
	    callbackInstantSearchApi(result);
	    return;
	  }
	
	  getExtrasProductDataByAjax(result.products, "boost-multiple-currencies", function(productsData) {    
	    callbackInstantSearchApi(getNewPrices(result, productsData));
	  })
	}
}