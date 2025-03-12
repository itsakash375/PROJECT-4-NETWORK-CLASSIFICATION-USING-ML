from email.parser import BytesParser
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse
import Logistic_Regression
import csv
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler  # Import StandardScaler

def filters(data):
    columns_to_remove = ['is_host_login', 'protocol_type', 'service', 'flag', 'land', 'is_guest_login',
                         'su_attempted', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins',
                         'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
                         'num_shells', 'num_access_files', 'srv_diff_host_rate']

    data = data.drop(columns=columns_to_remove)
    data = data.loc[:, (data != 0).any(axis=0)]
    data.to_csv('./Data/filtered_data.csv', index=False)

    return data

# Define the HTTP request handler class
class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    # GET method handler
    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(self.generate_form_page().encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    # Function to generate HTML page with form
    def generate_form_page(self):
        form_html = """
        <html>
        <head>
            <style>
                body { text-align: center; }
                form { margin-top: 50px; }
                input[type="file"] { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>Upload CSV File</h1>
            <form action="/" method="post" enctype="multipart/form-data">
                <input type="file" name="file" accept=".csv"><br>
                <input type="submit" value="Upload">
            </form>
            <br>
            %s
        </body>
        </html>
        """ % self.generate_table_from_csv()
        return form_html

    # POST method handler for file upload
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        content_type = self.headers['Content-Type']
        boundary = content_type.split('; ')[1].split('=')[1].encode()

        sections = post_data.split(b"--" + boundary)
        csv_start_pos = post_data.find(b'\r\n\r\n') + len(b'\r\n\r\n')
        csv_data = post_data[csv_start_pos:]

        # Save uploaded CSV
        with open('data.csv', 'w') as f:
            for x in sections:
                f.write(x.decode())

        with open('data.csv', 'r') as r:
            lines = r.readlines()[4:-2]
        with open('data.csv', 'w') as w:
            w.writelines(lines)

        # Load, filter, and scale data
        data = pd.read_csv('data.csv')
        data = filters(data)

        # Scale data using StandardScaler
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(data)
        data = pd.DataFrame(scaled_features, columns=data.columns)

        # Train the model
        y_test = Logistic_Regression.train(data)

        # Convert 0s and 1s to 'normal' and 'anomaly'
        converted_data = np.vectorize(lambda x: 'normal' if x == 1 else 'anomaly')(y_test)

        # Merge predictions with CSV
        converted_df = pd.DataFrame(converted_data, columns=['class'])
        merged_data = pd.concat([pd.read_csv('data.csv'), converted_df], axis=1)
        merged_data.to_csv('data.csv', index=False)

        self.send_response(303)
        self.send_header('Location', '/')
        self.end_headers()

    # Generate HTML table from CSV
    def generate_table_from_csv(self):
        try:
            with open('data.csv', newline='') as csvfile:
                reader = csv.reader(csvfile)
                table_html = "<h2>Uploaded CSV Table</h2><table border='1'>"
                for row in reader:
                    table_html += "<tr>" + "".join(f"<td>{col}</td>" for col in row) + "</tr>"
                table_html += "</table>"
            return table_html
        except FileNotFoundError:
            return ""

# Start the server
host, port = 'localhost', 8000
server = HTTPServer((host, port), SimpleHTTPRequestHandler)
print(f"Server running on {host}:{port}")

try:
    server.serve_forever()
except KeyboardInterrupt:
    server.shutdown()
    print("\nServer stopped.")
