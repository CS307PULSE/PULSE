import React, { useState } from "react";
import axios from "axios";

async function sendSearchAndReturn(sendSerach) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/search_bar",
    { query: sendSerach }
  );
  const data = response.data;
  console.log("Got");
  console.log(response);
  return data;
}

export default function FilterPopup({
  isOpen,
  onClose,
  itemsSelectable,
  setItems,
}) {
  const [itemsSelected, setItemsSelected] = useState([]);
  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    const formJson = {};
    //Converts to JSON object
    for (let [name, value] of formData) {
      //If item exists already - then add to array
      if (formJson[name]) {
        if (!Array.isArray(formJson[name])) {
          formJson[name] = [formJson[name]]; // Convert to array if it's not already
        }
        formJson[name].push(value);
      } else {
        formJson[name] = [value];
      }
    }

    if (itemsSelectable === undefined) {
      sendSearchAndReturn(formJson.searchItem).then((data) => {
        if (data !== null && data !== undefined) {
          setItems(data);
          console.log("This is filter selection:");
          console.log(data);
          onClose();
        } else {
          alert("Invalid Selection!");
        }
      });
    } else {
      setItems(formJson.items);
      console.log("This is filter selection:");
      console.log(formJson);
      onClose();
    }
  }

  function selectXindexes(start, end) {
    let selected = [];
    for (let i = start; i < end; i++) {
      selected.push(itemsSelectable[i].uri);
    }
    setItemsSelected(selected);
  }

  if (!isOpen) return null; //Don't do anything when not open

  return (
    <div className="PopupOverlay custom-draggable-cancel">
      <div className="PopupContent">
        Filter selection
        <button className="PopupCloseButton" onClick={onClose}>
          X
        </button>
        <form onSubmit={handleSubmit}>
          <div>
            {itemsSelectable === undefined ? (
              <input
                name="searchItem"
                rows={1}
                cols={20}
                className="nameField"
                placeholder="ItemSelected"
                required={true}
              />
            ) : (
              <select
                name="items"
                value={itemsSelected}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions
                  ).map((option) => option.value);
                  setItemsSelected(selectedOptions);
                }}
                multiple={true}
                required={true}
              >
                {itemsSelectable.map((item) => {
                  return (
                    <option
                      key={item.uri}
                      value={item.uri}
                      selected={itemsSelected.includes(item.uri)}
                    >
                      {item.name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          <div>
            <p>Automatic Selection</p>
            <button
              className="PopupCloseButton"
              onClick={() => {
                selectXindexes(0, 10);
              }}
            >
              Top 10
            </button>
            <button
              className="PopupCloseButton"
              onClick={() => {
                selectXindexes(0, 50);
              }}
            >
              Top 50
            </button>
          </div>
          <div>
            <button className="TypButton" type="submit">
              Generate Graph
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
