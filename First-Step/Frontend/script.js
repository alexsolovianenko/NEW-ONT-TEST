document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const textInput = document.getElementById("textInput").value;

    if (!fileInput || !textInput) {
        alert("Please select a file and enter a test name.");
        return;
    }

    // Step 1: Request pre-signed URL from the server
    try {
        const response = await fetch("http://localhost:8000/generate-upload-url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: textInput,  // Filename based on user's input
                fileType: fileInput.type,  // MIME type of the file
            })
        });

        if (!response.ok) {
            throw new Error("Failed to get pre-signed URL");
        }

        const { uploadURL } = await response.json();

        // Step 2: Upload the file to S3 using the pre-signed URL
        const uploadResponse = await fetch(uploadURL, {
            method: "PUT",
            headers: {
                "Content-Type": fileInput.type,  // Ensure proper content type is sent
            },
            body: fileInput,  // The file to be uploaded
        });

        if (!uploadResponse.ok) {
            throw new Error("Failed to upload file to S3");
        }

        // Step 3: Success
        alert("Upload Successful!");
        console.log("File uploaded successfully to S3");

    } catch (error) {
        alert("Error uploading file");
        console.error("Error uploading:", error);
    }
});
