document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const textInput = document.getElementById("textInput").value;

    if (!fileInput || !textInput) {
        alert("Please select a file and enter a test name.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput);
    formData.append("text", textInput);

    try {
        const response = await fetch("http://localhost:8000/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Failed to upload file");
        }

        const result = await response.json();
        alert(`Upload Successful! File URL: ${result.fileUrl}`);
        console.log("Upload Response:", result);
    } catch (error) {
        alert("Error uploading file");
        console.error("Error uploading:", error);
    }
});
