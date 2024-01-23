package com.munggle.post.service;

import com.munggle.domain.model.entity.Post;
import com.munggle.post.dto.PostCreateDto;
import com.munggle.post.dto.PostDetailResponseDto;
import com.munggle.post.dto.PostUpdateDto;
import com.munggle.post.mapper.PostMapper;
import com.munggle.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;

    @Override
    @Transactional
    public void insertPost(PostCreateDto postCreateDto) {
        String title = postCreateDto.getPostTitle();
        
        Post newPost = PostMapper.toEntity(postCreateDto);
        postRepository.save(newPost);
    }

    @Override
    @Transactional
    public void updatePost(PostUpdateDto postUpdateDto) {

        String newTitle = postUpdateDto.getPostTitle();
        String newContent = postUpdateDto.getPostContent();
        Boolean newIsPrivate = postUpdateDto.getIsPrivate();

        Post updatePost = postRepository.findById(postUpdateDto.getPostId())
                .orElseThrow();

        updatePost.updatePost(newTitle, newContent, newIsPrivate);
    }

    @Override
    @Transactional
    public void deletePost(Long postId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new NoSuchElementException());
        post.markAsDeletd();
    }

    @Override
    public PostDetailResponseDto getDetailPost(Long postId, Long userId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new NoSuchElementException());
        String nickname = "nickname"; // 닉네임 추후 수정
        Boolean isMine = true;
        PostDetailResponseDto detailPost = PostMapper.toPostDetailResponseDto(post, nickname, isMine);

        return detailPost;
    }
}