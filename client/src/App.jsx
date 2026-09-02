import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import AuthPanel from "./components/AuthPanel.jsx";
import UploadPanel from "./components/UploadPanel.jsx";
import DocumentList from "./components/DocumentList.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import OAuthSuccess from "./components/OAuthSuccess.jsx";
import { removeUser } from "../redux/userSlice.js";
import "./App.css";

export default function App() {
  const [doc, setDoc] = useState(null); // { documentId, fileName }
  const [refreshKey, setRefreshKey] = useState(0);
  
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.user);
  const currentUser = users[users.length - 1];

  function handleLogout() {
    dispatch(removeUser());
    setDoc(null);
  }

  function handleIngested(newDoc) {
    setDoc(newDoc);
    setRefreshKey((k) => k + 1);
  }

  return (
    <Routes>
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route
        path="/"
        element={
          <div className="app">
            <header className="app__header">
              <h1>
                Ask <span>Your</span> PDF
              </h1>
              <p>Upload a document, then ask it anything.</p>
              {currentUser && (
                <button className="app__logout" onClick={handleLogout}>
                  Log out ({currentUser.email || currentUser.name || "User"})
                </button>
              )}
            </header>

            {!currentUser ? (
              <AuthPanel />
            ) : (
              <main className="app__grid">
                <section className="app__panel">
                  <UploadPanel token={currentUser.token} onIngested={handleIngested} />
                  <div className="app__doclist">
                    <DocumentList
                      token={currentUser.token}
                      activeDocId={doc?.documentId}
                      refreshKey={refreshKey}
                      onSelect={(d) => setDoc(d)}
                    />
                  </div>
                </section>
                <section className="app__panel app__panel--chat">
                  <ChatPanel
                    token={currentUser.token}
                    documentId={doc?.documentId}
                    fileName={doc?.fileName}
                  />
                </section>
              </main>
            )}
          </div>
        }
      />
    </Routes>
  );
}