import subprocess

def push_to_github(commit_message="Update project files"):
    try:
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        subprocess.run(["git", "push"], check=True)
        print("Code successfully pushed to GitHub.")
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while pushing to GitHub: {e}")

if __name__ == "__main__":
    push_to_github("Automated commit: Updated project files")