package com.munggle.comment.repository;

import com.munggle.domain.model.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    Optional<Comment> findByIdAndIsDeletedFalse(Long commentId);

    Optional<List<Comment>> findAllByPostIdAndIsDeletedFalse(Long postId);

}
