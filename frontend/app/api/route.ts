export default (req, res) => {
  const { code } = req.body;
  const generatedCode = req.session.authCode; // 세션에서 저장된 코드 가져오기

  if (code === generatedCode) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
};
