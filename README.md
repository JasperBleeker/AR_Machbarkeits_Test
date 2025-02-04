# AR_Machbarkeits_Test
 Testing the capabilities of three.js and webXR

# **📌 AR Product Visualization - Documentation**  

## **🚀 Overview**  
This project is a **WebXR-powered Augmented Reality (AR) product viewer** built using **Three.js**. Users can place and interact with a **3D model** in a real-world environment via **AR hit testing**.  

---

## **📂 Project Structure**
```
/ar-product-viewer
│── index.html  (Main HTML file)
│── main.js  (Three.js + WebXR logic)
│── models/
│    ├── product.glb  (GLTF 3D model)
│── assets/ (optional: textures, UI elements)
```

---

## **📜 Features**
✅ **WebXR AR Button** → Enter AR mode from a mobile device  
✅ **Hit Testing** → Detect real-world surfaces for model placement  
✅ **Reticle Visualization** → Shows where the model will be placed  
✅ **Model Placement** → Tap to place one or multiple models  
✅ **Multiple Model Cloning** → Reuse the model without reloading  
✅ **Responsive Design** → Adjusts to different screen sizes  

---

## **📌 How It Works**
### **1️⃣ Initialization (`init()`)**
- Creates a **Three.js renderer** with WebXR enabled  
- Sets up the **scene, camera, and lights**  
- Adds an **AR button** to enter AR mode  
- Creates a **reticle** (ring indicator) for model placement  
- Registers event listeners for **session start, end, and window resizing**  

#### **📌 Key Code**
```js
renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// AR Button
const arButton = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] });
document.getElementById('ar-button-container').appendChild(arButton);
```

---

### **2️⃣ AR Session Handling (`onSessionStart()` & `onSessionEnd()`)**
- Requests a **hit test source** to detect surfaces  
- Listens for **"select"** events to place the model  

#### **📌 Key Code**
```js
async function onSessionStart() {
  const session = renderer.xr.getSession();
  const viewerSpace = await session.requestReferenceSpace('viewer');
  localSpace = await session.requestReferenceSpace('local');
  hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

  session.addEventListener('select', onSelect);
}
```

---

### **3️⃣ Reticle Handling (`render()`)**
- Updates the reticle's position based on **hit test results**  
- Shows the reticle **only when a valid surface is detected**  

#### **📌 Key Code**
```js
function render(time, frame) {
  if (frame) {
    if (hitTestSource && localSpace) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(localSpace);

        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }
  }
  renderer.render(scene, camera);
}
```

---

### **4️⃣ Model Placement (`onSelect()`)**
- Places the **product model at the reticle’s position**  
- If the model **hasn’t been loaded yet**, it loads the **GLB model**  
- Otherwise, **clones the existing model** and places it at the reticle  

#### **📌 Key Code**
```js
function onSelect() {
  if (reticle.visible) {
    placeObject(reticle.matrix);
  }
}

function placeObject(matrix) {
  if (!productModel) {
    loader.load('models/product.glb', (gltf) => {
      productModel = gltf.scene;
      productModel.scale.set(0.2, 0.2, 0.2);
      setMatrixAndAdd(productModel, matrix);
    });
  } else {
    const clone = productModel.clone();
    setMatrixAndAdd(clone, matrix);
  }
}

function setMatrixAndAdd(object, matrix) {
  object.matrix.copy(matrix);
  object.matrix.decompose(object.position, object.quaternion, object.scale);
  scene.add(object);
}
```

---

### **5️⃣ Responsive Design (`onWindowResize()`)**
- Adjusts **camera aspect ratio** when the window resizes  

#### **📌 Key Code**
```js
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
```

---

## **💡 How to Use**
1️⃣ Open the **webpage on an AR-enabled device** (Android with Chrome, Oculus, etc.)  
2️⃣ Click the **"Enter AR"** button to start AR mode  
3️⃣ **Move your phone** to detect a **flat surface** (wait for the reticle to appear)  
4️⃣ **Tap the screen** to place the **3D product model**  
5️⃣ **Tap again** to add more copies of the model  

---

## **🎯 Possible Enhancements**
🚀 **Gestures (Drag, Rotate, Scale)** → Allow users to manipulate the model  
🚀 **Model Selection UI** → Let users choose different products to place  
🚀 **Shadows & Lighting Enhancements** → Improve realism  
🚀 **Save & Restore Model Positions** → Keep model placement persistent  

---

## **🎉 Final Thoughts**
This WebXR AR viewer **successfully places 3D models in real-world space**, supporting **hit testing and multiple placements**. With further improvements, it can be **scaled into a full AR shopping or product visualization experience**! 🚀🔥  

---

### **📌 Credits**
Built with **Three.js & WebXR** 🚀  
AR Button powered by **Three.js ARButton.js**  

---

## **📜 License**
This project is open-source. Feel free to modify, improve, and use it in your projects! 😊🔥  

---
