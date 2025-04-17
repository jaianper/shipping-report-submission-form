import { useState, useRef, ChangeEvent, useEffect } from "react";
import "./RSFApp.css";

interface Photo {
  src: string | undefined;
  width: number;
  height: number;
}

interface Item {
  receivingNo: string;
  description: string;
  dimension: string;
  dimLength: string;
  dimWidth: string;
  dimHeight: string;
  weight: string;
  photo: Photo | null; // Store photo for each item
}

interface FormData {
  dateReceived: string;
  receivedBy: string;
  carrierOrTrucker: string;
  billOfLadingNo: string;
  timeStart: string;
  timeStop: string;
  customerNo: string;
  customer: string;
  shippingNo: string;
  dangerousGoods: string;
  foreignShipper: string;
  handlingAlert: string;
  damageAlert: string;
  items: Item[];
}

interface ItemValidation {
  //receivingNo: boolean;
  description: boolean;
  /*dimension: boolean;
  dimLength: boolean;
  dimWidth: boolean;
  dimHeight: boolean;*/
  weight: boolean;
  //photo: boolean;
}

interface FormValidation {
  dateReceived: boolean;
  receivedBy: boolean;
  /*carrierOrTrucker: boolean;
  billOfLadingNo: boolean;
  timeStart: boolean;
  timeStop: boolean;
  customerNo: boolean;*/
  customer: boolean;
  /*shippingNo: boolean;
  dangerousGoods: boolean;
  foreignShipper: boolean;
  handlingAlert: boolean;
  damageAlert: boolean;*/
  items: ItemValidation[];
}

const useScreenInfo = () => {
  const getScreenInfo = () => ({
    //width: window.innerWidth,
    //height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? "landscape" : "portrait"
  });

  const [screenInfo, setScreenInfo] = useState(getScreenInfo());

  useEffect(() => {
    const handleResize = () => setScreenInfo(getScreenInfo());

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenInfo;
};

const RSFApp = () => {
  const initialFormData = {
    dateReceived: "",
    receivedBy: "",
    carrierOrTrucker: "",
    billOfLadingNo: "",
    timeStart: "",
    timeStop: "",
    customerNo: "",
    customer: "",
    shippingNo: "",
    dangerousGoods: "",
    foreignShipper: "",
    handlingAlert: "",
    damageAlert: "",
    // Initialize other fields
    items: [
      {
        receivingNo: "",
        description: "",
        dimension: "",
        weight: "",
        dimLength: "",
        dimWidth: "",
        dimHeight: "",
        photo: null,
      },
    ], // Initialize with an empty array of items
  };
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [errors, setErrors] = useState<FormValidation>({
    dateReceived: false,
    receivedBy: false,
    /*carrierOrTrucker: false,
    billOfLadingNo: false,
    timeStart: false,
    timeStop: false,
    customerNo: false,*/
    customer: false,
    /*shippingNo: false,
    dangerousGoods: false,
    foreignShipper: false,
    handlingAlert: false,
    damageAlert: false,*/
    items: [
      {
        //receivingNo: false,
        description: false,
        /*dimension: false,
        dimLength: false,
        dimWidth: false,
        dimHeight: false,*/
        weight: false,
        //photo: false,
      },
    ],
  });

  const fieldNames = {
    dateReceived: "Date Received",
    receivedBy: "Received By",
    carrierOrTrucker: "Carrier / Trucker",
    billOfLadingNo: "Bill of Lading No.",
    timeStart: "Time Start",
    timeStop: "Time Stop",
    customerNo: "Customer No.",
    customer: "Customer",
    shippingNo: "Shipping No",
    dangerousGoods: "Dangerous Goods",
    foreignShipper: "Foreign Shipper",
    handlingAlert: "Handling Alert",
    damageAlert: "Damage Alert",
  };

  const reportItemFields = {
    receivingNo: { fieldName: "Receiving No", fieldStyle: { width: "26%" } },
    description: { fieldName: "Description", fieldStyle: { width: "36%" } },
    dimension: { fieldName: "Dimension", fieldStyle: { width: "26%" } },
    weight: { fieldName: "Weight", fieldStyle: { width: "12%" } },
  };
  const inputBorderColor = "#ccc";

  // State for photos and other variables
  const [capturing, setCapturing] = useState<boolean>(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null); // Track the current item being edited
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null); // Track captured photo
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // For controlling the photo capture modal visibility

  //const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1); // Track the current step of the form
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);

  // Refs for video and canvas elements with appropriate types
  const { orientation } = useScreenInfo();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(648);
  const [canvasHeight, setCanvasHeight] = useState<number>(480);
  
  // Handle form field changes
  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value ? String(value) : "",
    });
    setErrors({ ...errors, [name]: false }); // Se limpia el error al escribir
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value ? String(value) : "",
    };
    const validatedItems = [...errors.items];
    validatedItems[index] = { ...validatedItems[index], [field]: false };
    setFormData({
      ...formData,
      items: updatedItems,
    });
    setErrors({
      ...errors,
      items: validatedItems,
    });
  };

  // Add a new item
  const addItem = () => {
    if (formData.items.length == 5) {
      alert("It's not possible to add more items..");
      return;
    }
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          receivingNo: "",
          description: "",
          dimension: "",
          weight: "",
          dimLength: "",
          dimWidth: "",
          dimHeight: "",
          photo: null,
        },
      ],
    });

    setErrors({
      ...errors,
      items: [
        ...errors.items,
        {
          //receivingNo: false,
          description: false,
          /*dimension: false,
          dimLength: false,
          dimWidth: false,
          dimHeight: false,*/
          weight: false,
          //photo: false,
        },
      ],
    });
  };

  const setCanvasSize = () => {
    if(orientation === "landscape") {
      setCanvasWidth(648);
      setCanvasHeight(480);
    }
    else {
      setCanvasWidth(480);
      setCanvasHeight(648);
    }
  };

  const handleTakePhotoClick = (index: number) => {
    setCanvasSize();
    setCurrentItemIndex(index);
    setIsModalOpen(true); // Open modal to capture photo
    startCapture();
  };

  // Remove an item
  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // Handle Next and Previous Step Buttons
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Start capturing video
  const startCapture = () => {
    if (
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      !capturing
    ) {
      const constraints = {
        video: { facingMode: "environment" }, // Esto selecciona la cámara trasera
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStream(stream); // Store the stream for later use
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
            };
            setCapturing(true);
            setError(null); // Clear any previous errors
          }
        })
        .catch((err) => {
          console.error("Error accessing the camera: ", err);
          setError(
            "Failed to access camera. Please check permissions or try a different browser."
          );
        });
    } else {
      setError("getUserMedia not supported in this browser.");
      console.warn(error);
    }
  };

  const stopCapture = () => {
    if (stream) {
      // Stop all tracks in the media stream to free the camera
      stream.getTracks().forEach((track) => track.stop());
      setStream(null); // Clear the stream
      setCapturing(false);
    }
  };

  // Capture the photo
  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      setCanvasSize();
      const canvas = canvasRef.current;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const photoURL = canvas.toDataURL("image/png");
        setCurrentPhoto({src: photoURL, width: canvas.width, height: canvas.height});
        stopCapture();
      }
    }
  };

  // Approve the photo (add to photos list)
  const approvePhoto = () => {
    if (currentItemIndex !== null) {
      const newItems = [...formData.items];
      newItems[currentItemIndex].photo = currentPhoto;
      setFormData({ ...formData, items: newItems });
    }
    setIsModalOpen(false);
    setCurrentPhoto(null);
    stopCapture();
  };

  const rejectPhoto = () => {
    setCurrentPhoto(null);
    startCapture();
  };

  const closePhotoModal = () => {
    setCurrentPhoto(null);
    setIsModalOpen(false);
    stopCapture();
  };

  const removePhoto = (index: number) => {
    formData.items[index].photo = null;
    setFormData({
      ...formData,
      items: formData.items
    });
    setCurrentPhoto(null);
  };

  // Send form data and photos via email
  const sendEmail = async () => {
    setSendingEmail(true);
    try {
      const items: ItemValidation[] = [];
      formData.items.map((item) => {
        items.push({
          //receivingNo: item.receivingNo.trim() === "",
          description: item.description.trim() === "",
          /*dimension: item.dimension.trim() === "",
          dimLength: item.dimLength.trim() === "",
          dimWidth: item.dimWidth.trim() === "",
          dimHeight: item.dimHeight.trim() === "",*/
          weight: item.weight.trim() === "",
          //photo: item.photo.trim() === "",
        });
      });

      const newErrors: FormValidation = {
        dateReceived: formData.dateReceived.trim() === "",
        receivedBy: formData.receivedBy.trim() === "",
        /*carrierOrTrucker: formData.carrierOrTrucker.trim() === "",
        billOfLadingNo: formData.billOfLadingNo.trim() === "",
        timeStart: formData.timeStart.trim() === "",
        timeStop: formData.timeStop.trim() === "",
        customerNo: formData.customerNo.trim() === "",*/
        customer: formData.customer.trim() === "",
        /*shippingNo: formData.shippingNo.trim() === "",
        dangerousGoods: formData.dangerousGoods.trim() === "",
        foreignShipper: formData.foreignShipper.trim() === "",
        handlingAlert: formData.handlingAlert.trim() === "",
        damageAlert: formData.damageAlert.trim() === "",*/
        items: items,
      };

      setErrors(newErrors);

      let thereAreEmptyFields: boolean = false;

      Object.entries(newErrors).map(([key, value]: [string, boolean]) => {
        if (key !== "items") {
          thereAreEmptyFields ||= value;
        }
      });

      newErrors.items.map((item) => {
        Object.values(item).map((value) => {
          thereAreEmptyFields ||= value;
        });
      });

      if (thereAreEmptyFields) {
        setSendingEmail(false);
        alert("There are empty fields.");
        return;
      }

      // Send email through EmailJS (replace with your API details)
      const bodyData = {
        from: `${import.meta.env.VITE_SES_SENDER}`,
        to: `${import.meta.env.VITE_SES_RECIPIENTS}`,
        fieldNames: fieldNames,
        reportItemFields: reportItemFields,
        formData: formData,
      };
      const response = await fetch(
        `${import.meta.env.VITE_APIGATEWAY_SENDEMAIL_ENDPOINT}/send-email`,
        {
          method: "POST",
          body: JSON.stringify(bodyData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        setSendingEmail(false);
        throw new Error("Request error.");
      }

      setFormData(initialFormData);
      setCurrentStep(1);

      const result = await response.json();

      setSendingEmail(false);
      alert(result.message);
    } catch (error) {
      console.error("Error sending email:", error);
      setSendingEmail(false);
      alert(`Failed to send email - ${JSON.stringify(error)}`);
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Report Submission Form</h1>
      </div>
      {/* Wizard Steps */}
      <div className="app-body">
        <form>
          {/* Step 1: Basic Details */}
          {currentStep === 1 && (
            <div className="step">
              <label>
                Date Received:
                <input
                  type="date"
                  name="dateReceived"
                  value={formData.dateReceived}
                  maxLength={20}
                  onChange={handleFieldChange}
                  style={{
                    borderColor: errors.dateReceived ? "red" : inputBorderColor,
                  }}
                />
              </label>
              <label>
                Received By:
                <input
                  type="text"
                  name="receivedBy"
                  value={formData.receivedBy}
                  maxLength={35}
                  onChange={handleFieldChange}
                  style={{
                    borderColor: errors.receivedBy ? "red" : inputBorderColor,
                  }}
                />
              </label>
              <div className="two-column-fields">
                <label className="label-time">
                  Time Start:
                  <input
                    type="time"
                    name="timeStart"
                    value={formData.timeStart}
                    maxLength={10}
                    onChange={handleFieldChange}
                    //style={{ borderColor: errors.timeStart ? "red" : inputBorderColor }}
                  />
                </label>
                <label className="label-time">
                  Time Stop:
                  <input
                    type="time"
                    name="timeStop"
                    value={formData.timeStop}
                    maxLength={10}
                    onChange={handleFieldChange}
                    //style={{ borderColor: errors.timeStop ? "red" : inputBorderColor }}
                  />
                </label>
              </div>
              <label>
                Customer No.:
                <input
                  type="text"
                  name="customerNo"
                  value={formData.customerNo || ""}
                  maxLength={35}
                  onChange={handleFieldChange}
                  //style={{ borderColor: errors.customerNo ? "red" : inputBorderColor }}
                />
              </label>
              <label>
                Customer:
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  maxLength={35}
                  onChange={handleFieldChange}
                  style={{
                    borderColor: errors.customer ? "red" : inputBorderColor,
                  }}
                />
              </label>
              <label>
                Shipping No:
                <input
                  type="number"
                  name="shippingNo"
                  value={formData.shippingNo || ""}
                  min={0}
                  max={999999999999999}
                  onChange={handleFieldChange}
                  //style={{ borderColor: errors.shippingNo ? "red" : inputBorderColor }}
                />
              </label>
              <div className="step-buttons">
                <button type="button" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: time Start & Stop */}
          {currentStep === 2 && (
            <div className="step">
              <label>
                Carrier / Trucker:
                <input
                  type="text"
                  name="carrierOrTrucker"
                  value={formData.carrierOrTrucker}
                  maxLength={35}
                  onChange={handleFieldChange}
                  //style={{ borderColor: errors.carrierOrTrucker ? "red" : inputBorderColor }}
                />
              </label>
              <label>
                Bill of Lading No.:
                <input
                  type="text"
                  name="billOfLadingNo"
                  value={formData.billOfLadingNo}
                  maxLength={15}
                  onChange={handleFieldChange}
                  //style={{ borderColor: errors.billOfLadingNo ? "red" : inputBorderColor }}
                />
              </label>
              <label>
                Dangerous Goods:
                <input
                  type="text"
                  name="dangerousGoods"
                  value={formData.dangerousGoods}
                  maxLength={35}
                  onChange={handleFieldChange}
                  //style={{ borderColor: errors.dangerousGoods ? "red" : inputBorderColor }}
                />
              </label>
              <label>
                Foreign Shipper:
                <input
                  type="text"
                  name="foreignShipper"
                  value={formData.foreignShipper}
                  maxLength={35}
                  onChange={handleFieldChange}
                  //style={{ borderColor: errors.foreignShipper ? "red" : inputBorderColor }}
                />
              </label>
              <label>
                Handling Alert:
                <input
                  type="text"
                  name="handlingAlert"
                  value={formData.handlingAlert}
                  maxLength={35}
                  onChange={handleFieldChange}
                  //style={{ borderColor: errors.handlingAlert ? "red" : inputBorderColor }}
                />
              </label>
              <label>
                Damage Alert:
                <input
                  type="text"
                  name="damageAlert"
                  value={formData.damageAlert}
                  maxLength={35}
                  onChange={handleFieldChange}
                  //style={{ borderColor: errors.damageAlert ? "red" : inputBorderColor }}
                />
              </label>
              <div className="step-buttons">
                <button type="button" onClick={handlePreviousStep}>
                  Back
                </button>
                <button type="button" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step">
              <h2>Add Items</h2>

              {/* Render Items */}
              <div className="items-list">
                {formData.items.map((item, index) => (
                  <div className="item" key={index}>
                    <label>
                      Receiving No.:
                      <input
                        type="number"
                        value={item.receivingNo || ""}
                        min={0}
                        max={999999999999999}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "receivingNo",
                            parseInt(e.target.value)
                          )
                        }
                        //style={{ borderColor: errors.items[index].receivingNo ? "red" : inputBorderColor }}
                      />
                    </label>
                    <label>
                      Description:
                      <input
                        type="text"
                        value={item.description}
                        maxLength={50}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        style={{
                          borderColor: errors.items[index].description
                            ? "red"
                            : inputBorderColor,
                        }}
                      />
                    </label>
                    <div className="two-column-fields">
                      <label className="label-dim">
                        Dimension (Inches):
                        <div
                          className="dim-field"
                          /*style={{
                            borderColor:
                              errors.items[index].dimLength ||
                              errors.items[index].dimWidth ||
                              errors.items[index].dimHeight
                                ? "red"
                                : inputBorderColor,
                          }}*/
                        >
                          <input
                            className="dim-input"
                            type="number"
                            placeholder="L"
                            value={item.dimLength || ""}
                            min={0}
                            max={999}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "dimLength",
                                e.target.value
                              )
                            }
                          />{" "}
                          x
                          <input
                            className="dim-input"
                            type="number"
                            placeholder="W"
                            value={item.dimWidth || ""}
                            min={0}
                            max={999}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "dimWidth",
                                e.target.value
                              )
                            }
                          />{" "}
                          x
                          <input
                            className="dim-input"
                            type="number"
                            placeholder="H"
                            value={item.dimHeight || ""}
                            min={0}
                            max={999}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "dimHeight",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </label>
                      <label className="label-weight">
                        Weight (Lbs):
                        <input
                          type="number"
                          value={item.weight || ""}
                          min={0}
                          max={999}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "weight",
                              parseFloat(e.target.value)
                            )
                          }
                          style={{
                            borderColor: errors.items[index].weight
                              ? "red"
                              : inputBorderColor,
                          }}
                        />
                      </label>
                    </div>
                    {/* Display the photo or take a new one */}
                    <div className="photo-section">
                      {item.photo ? (
                        <div className="attached-photo">
                          <button className="button-remove-photo" type="button" onClick={() => removePhoto(index)}>x</button>
                          <img src={item.photo.src} alt="Item" width="100" />
                        </div>
                      ) : (
                        <div className="take-a-photo">
                          <button
                            type="button"
                            onClick={() => handleTakePhotoClick(index)}
                          >
                            <img
                              src={`${
                                import.meta.env.BASE_URL
                              }photo-camera.png`}
                              className="img-photo-camera"
                            />
                            <span className="text">Take a photo</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Button to remove the item */}
                    <div className="step-buttons">
                      <button
                        className="button-remove-item"
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={index === 0}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {/* Button to add a new item */}
                <button
                  className="button-add-item"
                  type="button"
                  onClick={addItem}
                >
                  Add Item
                </button>
              </div>
              <div className="step-buttons">
                <button type="button" onClick={handlePreviousStep}>
                  Back
                </button>
                <button type="button" onClick={handleNextStep}>
                  Next
                </button>
              </div>
              {/* Modal for Photo Capture */}
              {isModalOpen && (
                <div>
                  <div className="overlay"></div>
                  <div className="capture-photo">
                    {!currentPhoto && (
                      <div>
                        <video
                          ref={videoRef}
                          width={orientation === "landscape" ? 648 : 480}
                          height={orientation === "landscape" ? 480 : 648}
                          autoPlay
                        ></video>
                        <canvas
                          ref={canvasRef}
                          width={canvasWidth}
                          height={canvasHeight}
                          style={{ display: "none" }}
                        ></canvas>
                        <div className="view-buttons">
                          <button type="button" onClick={capturePhoto}>
                            Capture photo
                          </button>
                          <button type="button" onClick={closePhotoModal}>
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                    {currentPhoto && (
                      <div>
                        <img src={currentPhoto.src} alt="Preview" width="100%" />
                        <div className="view-buttons">
                          <button type="button" onClick={approvePhoto}>
                            Approve
                          </button>
                          <button type="button" onClick={rejectPhoto}>
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 4 && (
            <div className="step">
              {sendingEmail && (
                <div className="overlay">
                  <div className="spinner"></div>
                </div>
              )}
              <h2>Review your information:</h2>
              <table className="report-table first-table">
                <tbody>
                  {Object.entries(formData).map(
                    ([key, value]) =>
                      !Array.isArray(value) && (
                        <tr key={key}>
                          <th>{fieldNames[key as keyof typeof fieldNames]}</th>
                          <td>{value}</td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
              <div>
                <table className="report-table second-table">
                  <thead>
                    <tr>
                      {Object.keys(formData.items[0]).map(
                        (key) =>
                          Object.keys(reportItemFields).includes(key) && (
                            <th
                              style={
                                reportItemFields[
                                  key as keyof typeof reportItemFields
                                ].fieldStyle
                              }
                            >
                              {
                                reportItemFields[
                                  key as keyof typeof reportItemFields
                                ].fieldName
                              }
                            </th>
                          )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item) => (
                      <tr key={item.receivingNo}>
                        <td style={reportItemFields["receivingNo"].fieldStyle}>
                          R {formData.shippingNo}-{item.receivingNo}
                        </td>
                        <td style={reportItemFields["description"].fieldStyle}>
                          {item.description}
                        </td>
                        <td style={reportItemFields["dimension"].fieldStyle}>
                          {item.dimLength} x {item.dimWidth} x {item.dimHeight}
                        </td>
                        <td style={reportItemFields["weight"].fieldStyle}>
                          {item.weight}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="step-buttons">
                <button type="button" onClick={handlePreviousStep}>
                  Back
                </button>
                <button
                  className="button-send"
                  type="button"
                  onClick={sendEmail}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}email-icon.png`}
                    className="img-email"
                  />
                  <span>Send Email</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RSFApp;
