import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaDownload, FaHeart, FaEye } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { videoService } from '../services/videoService';
import toast from 'react-hot-toast';

const VideoCard = ({ video, onLike }) => {
  const { user, isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(user ? video.likes?.includes(user._id) : false);
  const [likesCount, setLikesCount] = useState(video.likes?.length || 0);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to like videos');
      return;
    }

    try {
      const result = await videoService.toggleLike(video._id);
      setIsLiked(result.liked);
      setLikesCount(result.likes);
      if (onLike) onL