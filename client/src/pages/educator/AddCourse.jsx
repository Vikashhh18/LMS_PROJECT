import React, { useContext, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import uniqid from 'uniqid';
import { assets } from '../../assets/assets';
import 'quill/dist/quill.snow.css';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddCourse = () => {
  const {getToken,backendUrl}=useContext(AppContext);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapter, setChapter] = useState([]);
  const [showPop, setShowPop] = useState(false);
  const [courseDescription, setCourseDescription] = useState('');
  const [currentChapterId, setCurrentChapterId] = useState(null);

  const [lectureDetails, setLectureDetails] = useState({
    lectureId: '',
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
    lectureOrder: 0
  });

  const handlerChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter chapter name: ');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapter.length > 0 ? chapter.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapter([...chapter, newChapter]);
      }
    } else if (action === 'remove') {
      setChapter(chapter.filter((ch) => ch.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapter(
        chapter.map((ch) =>
          ch.chapterId === chapterId ? { ...ch, collapsed: !ch.collapsed } : ch
        )
      );
    }
  };

  const handleAddLecture = () => {
    if (!lectureDetails.lectureTitle || !lectureDetails.lectureDuration || !lectureDetails.lectureUrl) {
      toast.error('Please fill all lecture fields.');
      return;
    }

    const lectureId = uniqid();
    const updatedChapters = chapter.map(ch => {
      if (ch.chapterId === currentChapterId) {
        const lectureOrder = ch.chapterContent.length + 1;
        return {
          ...ch,
          chapterContent: [...ch.chapterContent, { 
            ...lectureDetails,
            lectureId,
            lectureOrder,
            isPreviewFree: lectureDetails.isPreviewFree
          }],
        };
      }
      return ch;
    });

    setChapter(updatedChapters);
    setLectureDetails({
      lectureId: '',
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
      lectureOrder: 0
    });
    setShowPop(false);
  };

  const handleSubmit = async(e) => {
    try {
      e.preventDefault();
      
      if (!image) {
        toast.error("Thumbnail is required");
        return;
      }
      
      if (discount < 0 || discount > 100) {
        toast.error("Discount must be between 0 and 100");
        return;
      }
      
      if (chapter.length === 0) {
        toast.error("At least one chapter is required");
        return;
      }
      
      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapter.map((ch, chIndex) => ({
          ...ch,
          chapterOrder: chIndex + 1,
          chapterContent: ch.chapterContent.map((lecture, lectureIndex) => ({
            lectureId: lecture.lectureId || uniqid(),
            lectureTitle: lecture.lectureTitle,
            lectureDuration: Number(lecture.lectureDuration),
            lectureUrl: lecture.lectureUrl,
            isPreviewFree: lecture.isPreviewFree,
            lectureOrder: lecture.lectureOrder || (lectureIndex + 1)
          }))
        }))
      };

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', image);
      
      const token = await getToken();
      const {data} = await axios.post(
        backendUrl + "/api/educator/add-course",
        formData,
        {headers: {Authorization: `Bearer ${token}`}}
      );
      
      if (data.success) {
        toast.success(data.message);
        setChapter([]);
        setCourseDescription('');
        setCoursePrice(0);
        setCourseTitle('');
        setDiscount(0);
        setImage(null);
        quillRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error submitting course:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' });

      quillRef.current.on('text-change', () => {
        setCourseDescription(quillRef.current.root.innerHTML);
      });
    }
  }, []);

  return (
    <div className="h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl w-full text-gray-700">
        <div className="flex flex-col gap-1">
          <p>Course Title</p>
          <input
            type="text"
            onChange={(e) => setCourseTitle(e.target.value)}
            required
            value={courseTitle}
            placeholder="Type here..."
            className="outline-none py-2 px-4 rounded border border-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <p>Course Description</p>
          <div ref={editorRef} className="h-40 border border-gray-500 rounded p-2" />
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-1">
            <p>Course Price</p>
            <input
              type="number"
              onChange={(e) => setCoursePrice(Number(e.target.value))}
              value={coursePrice}
              required
              className="outline-none py-2 px-4 rounded border border-gray-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <p>Discount %</p>
            <input
              type="number"
              onChange={(e) => setDiscount(Number(e.target.value))}
              value={discount}
              className="outline-none py-2 px-4 rounded border border-gray-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <p>Course Thumbnail</p>
            <label htmlFor="thumbnailImage" className="flex items-center gap-3 cursor-pointer">
              <img src={assets.file_upload_icon} className="p-2 bg-blue-500 rounded" alt="" />
              <input
                type="file"
                id="thumbnailImage"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                hidden
              />
              {image && <img src={URL.createObjectURL(image)} className="max-h-10" alt="Preview" />}
            </label>
          </div>
        </div>

        {/* Chapters & Lectures */}
        <div className="mt-6">
          {chapter.map((item, index) => (
            <div key={index} className="bg-white border rounded-lg mb-4">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                  <img
                    src={assets.dropdown_icon}
                    className={`cursor-pointer w-2 transition-transform ${item.collapsed && '-rotate-90'}`}
                    alt=""
                    onClick={() => handlerChapter('toggle', item.chapterId)}
                  />
                  <span className="font-semibold">{index + 1}. {item.chapterTitle}</span>
                </div>
                <span className="text-gray-500">{item.chapterContent.length} Lectures</span>
                <img
                  src={assets.cross_icon}
                  className="cursor-pointer"
                  onClick={() => handlerChapter('remove', item.chapterId)}
                  alt=""
                />
              </div>

              {!item.collapsed && (
                <div className="p-4">
                  {item.chapterContent.map((lecture, lIndex) => (
                    <div
                      key={lIndex}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded border mb-2 shadow-sm"
                    >
                      <div>
                        <p className="font-medium">{lIndex + 1}. {lecture.lectureTitle}</p>
                        <p className="text-sm text-gray-600">
                          Duration: {lecture.lectureDuration} mins |{' '}
                          <a href={lecture.lectureUrl} target="_blank" className="text-blue-500 underline" rel="noreferrer">
                            Watch
                          </a>{' '}
                          | <span className={`inline-block px-2 py-0.5 text-xs rounded ${lecture.isPreviewFree ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                          </span>
                        </p>
                      </div>
                      <img src={assets.cross_icon} className="cursor-pointer h-4" alt="Delete" />
                    </div>
                  ))}
                  <div
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2 text-sm text-blue-600 hover:bg-gray-200"
                    onClick={() => {
                      setCurrentChapterId(item.chapterId);
                      setShowPop(true);
                    }}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}

          <div
            onClick={() => handlerChapter('add')}
            className="flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer mt-2 text-blue-600 hover:bg-blue-200"
          >
            + Add Chapter
          </div>
        </div>

        {/* Popup for adding lecture */}
        {showPop && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
            <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>

              <div className="mb-2">
                <p>Lecture Title</p>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded py-1 px-2"
                  value={lectureDetails.lectureTitle}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                />
              </div>

              <div className="mb-2">
                <p>Duration (Minutes)</p>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded py-1 px-2"
                  value={lectureDetails.lectureDuration}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                />
              </div>

              <div className="mb-2">
                <p>Lecture URL</p>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded py-1 px-2"
                  value={lectureDetails.lectureUrl}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lectureDetails.isPreviewFree}
                    onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                  />
                  Free Preview
                </label>
              </div>

              <button
                type="button"
                onClick={handleAddLecture}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Lecture
              </button>

              <img
                src={assets.cross_icon}
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() => {
                  setShowPop(false);
                  setLectureDetails({
                    lectureId: '',
                    lectureTitle: '',
                    lectureDuration: '',
                    lectureUrl: '',
                    isPreviewFree: false,
                    lectureOrder: 0
                  });
                }}
                alt="Close"
              />
            </div>
          </div>
        )}

        <button type="submit" className="bg-black cursor-pointer text-white w-max py-2.5 px-8 rounded my-4">
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddCourse;
