Compact products.json capture (when the sandbox cannot reach Shopify)

The sandbox cannot fetch shorelist.myshopify.com. In a Chrome tab already on a shorelist.myshopify.com page, run this
in the console and copy the output for only the handles you need into a local file; pass that file to
tools/ingest-shopify-products.mjs --in.

  const want=['handle-a','handle-b'];
  const j=await fetch('/products.json?limit=250').then(r=>r.json());
  JSON.stringify(j.products.filter(p=>want.includes(p.handle)).map(p=>({i:p.id,h:p.handle,t:p.title,o:p.options.map(o=>o.name+':'+o.values.join('/')),
   v:p.variants.map(v=>[v.id,v.option1,v.option2,v.option3,v.price,v.available?1:0,v.featured_image?v.featured_image.src.split('/').pop().split('?')[0]:null]),
   im:p.images.map(m=>[m.src.split('/').pop().split('?')[0],m.variant_ids.length,m.width,m.height])})))
