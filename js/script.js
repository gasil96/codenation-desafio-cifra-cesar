formElem.addEventListener('formdata', (e) => {
    console.log('formdata fired');
   
    // Get the form data from the event object
    let data = e.formData;
    for (var value of data.values()) {
      console.log(value);
    }
   
    // submit the data via XHR
    let request = new XMLHttpRequest();
    request.open("POST", "/formHandler");
    request.send(data);
  });