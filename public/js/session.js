async function userLogged() {
  let userData
  const response = await fetch(`http://localhost:${location.port}/session/`, {
    method: 'GET',
  })
  if (response.status === 401) {
    return null
  }
  userData = await response.json()
  console.log('loggeado', userData)
    return userData
}


function userLoggedTemplates(userData, productsData ) {
  document.querySelector('#sessionUser').innerHTML = logOkTemplate( userData )
  document.querySelector('#productList').innerHTML = productsTable( productsData )
  chatInit(userData.username)
}


async function cartView( userData, productsData ) {
  let userCart
  await fetch(`http://localhost:${location.port}/api/carrito`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${userData.token}`
    }
  })
  .then((response) => response.json())
  .then((data) => {
      userCart = data.products
      document.getElementById("productList").innerHTML = cartViewTemplate( userCart, productsData )
      
      document.getElementById("homeBtn").addEventListener("click", ev => {
        location.reload()
      })
      
      document.getElementById("buyBtn").addEventListener("click", async ev => {
        await fetch(`http://localhost:${location.port}/api/carrito/order`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        })
        .then(() => {
          toast('Su compra ha sido realizada', "#00800", "#ff90ee90")
          setTimeout(() => {
            location.reload()
          },2000)  
        })
      })

    })

  return 
}


async function userLogout( userData ){
  fetch(`http://localhost:${location.port}/session/logout/`, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${userData.token}`
    }
  })
  .then((response) => response.json())
  .then((data) => {
  })
  document.querySelector('#sessionUser').innerHTML = logByeTemplate( userData.username )
  await setTimeout(() => {
    location.reload()
  }, 2000)
}


async function productAddToCart ( itemId, userData ) {
  await fetch(`http://localhost:${location.port}/api/carrito?itemId=${itemId}&number=1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userData.token}`
    }
  })
  toast('Producto agregado al carrito', "#00800", "#ff90ee90")
  return 
}


function logged( userData, productsData ){
  userLoggedTemplates( userData, productsData )

  document.getElementById("productList").addEventListener("click", ev => {
    const productId = ev.target.id
    if ( productId.length == 24 ) {
      productAddToCart( productId, userData )
    }
  })

  document.getElementById("logoutBtn").addEventListener("click", ev => {
    userLogout( userData )
  })

  document.getElementById("cartBtn").addEventListener("click", ev => {
    cartView( userData, productsData )

  })
}