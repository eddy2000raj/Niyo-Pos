import Page from '../layouts/Page';

const SupportPage = () => {
  return (
    <Page>
      <div className="p-sm">
        <div className="grid gutter-between">
          <div>
            <h1 className="lg semi-bold">Customer Support</h1>
            <p className="mt-xs">
              For support &amp; sales related queries, please contact the below
              mentioned.
            </p>
          </div>
          <div></div>
        </div>
        <div className="grid gutter-md mt-lg">
          <div className="col-4">
            <div className="card p-lg h-full s">
              <p className="bold">
                For any concerns/issues kindly raise a support ticket from your
                registered number through Retailer App or Kindly contact your
                R-KAM.
              </p>
              <div>
                <span className="bold">1.</span> Open the App and go to your
                profile.
              </div>
              <div>
                <span className="bold">2.</span> Click on &quot;Raise a
                Ticket&quot;.
              </div>
              <div>
                <span className="bold">3.</span> Select the timeline for the
                issue.
              </div>
              <div>
                <span className="bold">4.</span> Add details related to your
                issue.
              </div>
              <div>
                <span className="bold">5.</span> Click Submit.
              </div>
              <br />
              <p className="bold">
                किसी भी चिंता/समस्या के लिए कृपया अपने पंजीकृत नंबर से रिटेलर ऐप
                के माध्यम से एक समर्थन टिकट प्राप्त करें या कृपया अपने आर-केएएम
                से संपर्क करें।
              </p>
              <div>
                <span className="bold">1.</span> ऐप खोलें और अपनी प्रोफाइल पर
                जाएं।
              </div>
              <div>
                <span className="bold">2.</span> &quot;टिकट बढ़ाएँ&quot; पर
                क्लिक करें।
              </div>
              <div>
                <span className="bold">3.</span> समस्या के लिए समयरेखा चुनें।
              </div>
              <div>
                <span className="bold">4.</span> अपनी समस्या से संबंधित विवरण
                जोड़ें।
              </div>
              <div>
                <span className="bold">5.</span> सबमिट पर क्लिक करें।
              </div>
            </div>
          </div>
          <div className="col-8 flex image-container">
            <div>
              <img className="step" src="/images/step1.jpg" alt="" />
            </div>
            <div>
              <i className="fas fa-regular fa-arrow-right arrow"></i>
            </div>
            <div>
              <img className="step" src="/images/step2.jpg" alt="" />
            </div>
            <div>
              <i className="fas fa-regular fa-arrow-right arrow"></i>
            </div>
            <div>
              <img className="step" src="/images/step3.jpg" alt="" />
            </div>
          </div>
          {/* <div className="col-4">
            <div className="card p-lg">
              <div className="bold">Area Sales Heads</div>
              <div className="xs mt-sm">Nishant Agarwal</div>
              <div className="xs">+91-8897237272</div>
              <div className="xs mt-sm">Sunil Panwar</div>
              <div className="xs">+91-7727888787</div>
            </div>
          </div> */}
        </div>
      </div>
    </Page>
  );
};

export default SupportPage;
