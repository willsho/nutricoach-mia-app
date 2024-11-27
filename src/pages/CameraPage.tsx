import { useState, useRef, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { IconButton, Box } from '@mui/material';
import { PhotoCamera, FlipCameraIos, Collections, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CameraContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#000',
  display: 'flex',
  flexDirection: 'column',
});

const VideoPreview = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: 20,
  right: 20,
  color: 'white',
});

const GalleryPreview = styled('img')({
  width: 60,
  height: 60,
  borderRadius: 8,
  objectFit: 'cover',
  position: 'absolute',
  bottom: 40,
  left: 20,
});

const ControlsContainer = styled(Box)({
  position: 'absolute',
  bottom: 40,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const GalleryButton = styled(IconButton)({
  position: 'absolute',
  bottom: 40,
  left: 20,
  color: 'white',
  backgroundColor: 'rgba(51, 51, 51, 0.7)',
  '&:hover': {
    backgroundColor: 'rgba(51, 51, 51, 0.9)',
  },
});

// 添加平台检测工具函数
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// 添加拍照按钮的样式组件
const ShutterButton = styled(IconButton)({
  width: 80,
  height: 80,
  padding: 0,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '6px solid white',
    borderRadius: '50%',
    boxSizing: 'border-box',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 'calc(100% - 20px)',
    height: 'calc(100% - 20px)',
    backgroundColor: 'white',
    borderRadius: '50%',
  },
  '&:active::after': {
    width: 'calc(100% - 24px)',
    height: 'calc(100% - 24px)',
  },
});

export default function CameraPage() {
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const handleSelectPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // 基础图片类型支持
    
    // 为 iOS 设备添加特殊属性
    if (isIOS) {
      input.accept = 'image/*;capture=camera';
      // iOS 需要这些属性来支持相册访问
      input.setAttribute('capture', 'camera');
    } else {
      // Android 设备
      input.setAttribute('capture', 'environment');
      // 确保支持常见图片格式
      input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    }
    
    // 处理文件选择
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          alert('请选择图片文件');
          return;
        }
        
        // 检查文件大小（例如限制为 10MB）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert('图片大小不能超过10MB');
          return;
        }

        try {
          const url = URL.createObjectURL(file);
          setLastPhoto(url);
        } catch (error) {
          console.error('处理图片失败:', error);
          alert('处理图片失败，请重试');
        }
      }
    };

    // 处理可能的错误
    input.onerror = (error) => {
      console.error('选择图片失败:', error);
      alert('选择图片失败，请重试');
    };
    
    // 触发文件选择
    try {
      input.click();
    } catch (error) {
      console.error('打开相册失败:', error);
      alert('打开相册失败，请检查权限设置');
    }
  };

  const handleTakePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      if (isIOS) {
        // iOS设备：将照片转换为base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // 停止视频流
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        
        // 跳转到分析页面，传递base64数据
        navigate(`/analysis?input=${encodeURIComponent(imageData)}`);
      } else {
        // 安卓设备：使用Blob URL
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          }, 'image/jpeg', 0.8);
        });

        const imageUrl = URL.createObjectURL(blob);
        
        // 停止视频流
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        
        // 跳转到分析页面
        navigate(`/analysis?input=${encodeURIComponent(imageUrl)}`);
      }
      
    } catch (error) {
      console.error('拍照失败:', error);
      alert('拍照失败，请重试');
    }
  };

  useEffect(() => {
    // 请求相机权限并启动预览
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('相机访问失败:', err);
      }
    }
    
    startCamera();
  }, []);

  return (
    <CameraContainer>
      <VideoPreview ref={videoRef} autoPlay playsInline />
      
      <CloseButton onClick={() => navigate(-1)}>
        <Close />
      </CloseButton>
      
      <ControlsContainer>
        <ShutterButton onClick={handleTakePhoto}>
          {/* 移除 PhotoCamera 图标 */}
        </ShutterButton>
      </ControlsContainer>

      {lastPhoto ? (
        <GalleryPreview 
          src={lastPhoto} 
          onClick={handleSelectPhoto}
        />
      ) : (
        <GalleryButton onClick={handleSelectPhoto}>
          <Collections sx={{ width: 24, height: 24 }} />
        </GalleryButton>
      )}
    </CameraContainer>
  );
} 