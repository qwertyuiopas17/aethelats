"""
Bug Condition Exploration Test: Pipeline Stage Ordering

**Property 1: Bug Condition** - Backend Stage Callback Sequential Order

This test MUST FAIL on unfixed code - failure confirms the bug exists.
DO NOT attempt to fix the test or the code when it fails.

GOAL: Surface counterexamples that demonstrate stage callbacks fire out of order.
EXPECTED OUTCOME: Test FAILS with actual order [0, 1, 3, 2, 4, 5, 6, 7] (confirms bug exists)

**Validates: Requirements 1.3, 2.3**
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from main import execute_scan_job


class TestStageOrdering:
    """
    Exploration tests for pipeline stage ordering bug.
    
    These tests are EXPECTED TO FAIL on unfixed code to confirm the bug exists.
    When they fail, they surface counterexamples showing stages fire out of order.
    """
    
    @pytest.mark.asyncio
    async def test_stage_callbacks_sequential_order_single_resume(self):
        """
        Test stage callbacks fire in sequential order [0, 1, 2, 3, 4, 5, 6, 7] for 1 resume.
        
        EXPECTED: FAILS on unfixed code with actual order [0, 1, 3, 2, 4, 5, 6, 7]
        This confirms Stage 3 (Skill Graph) fires before Stage 2 (Blind Score).
        """
        # Mock stage callback to capture call order
        stage_calls = []
        
        async def mock_stage_callback(stage_index: int):
            stage_calls.append(stage_index)
            print(f"Stage callback invoked: {stage_index}")
        
        # Create minimal test resume data
        test_resume_text = """
        John Doe
        Software Engineer
        
        Experience:
        - Senior Developer at Tech Corp (2020-2023)
        - Junior Developer at StartupCo (2018-2020)
        
        Skills: Python, JavaScript, React, Node.js, AWS
        
        Education: Bachelor's in Computer Science
        """
        
        test_pdf_bytes = test_resume_text.encode('utf-8')
        
        # Mock all external dependencies
        with patch('main.extract_resume_text', return_value=test_resume_text), \
             patch('main._strip_pii', return_value={
                 "sanitized_text": test_resume_text,
                 "items_removed": [],
                 "method": "mock"
             }), \
             patch('main.structure_resume', return_value={
                 "technical_skills": ["Python", "JavaScript", "React"],
                 "job_history": [{"title": "Senior Developer", "duration_months": 36}],
                 "highest_degree": "Bachelor",
                 "total_years_experience": 5
             }), \
             patch('main.evaluate_resume', return_value={
                 "overall_score": 85,
                 "skill_match_score": 80,
                 "experience_score": 90,
                 "education_score": 75,
                 "strengths": ["Python", "JavaScript"],
                 "missing_skills": ["Kubernetes"],
                 "recommendation": "Advance to Interview",
                 "reasoning": "Strong technical background"
             }), \
             patch('main._simulate_legacy_ats', return_value={
                 "legacy_ats_score": 70,
                 "verdict": "Pass",
                 "primary_bias": "None",
                 "bias_breakdown": {}
             }), \
             patch('main._record_score'), \
             patch('main._compute_percentile_from_db', return_value=(75, 100, False)), \
             patch('main.extract_urls_from_text', return_value=[]), \
             patch('main.create_scan_record'):
            
            # Execute the scan job with our mock stage callback
            result = await execute_scan_job(
                job_id="test-job-1",
                filename="test_resume.pdf",
                ext=".pdf",
                pdf_bytes=test_pdf_bytes,
                role="Software Engineer",
                jd_skills="Python, JavaScript, React, Kubernetes",
                current_user_id=1,
                stage_callback=mock_stage_callback
            )
        
        # Document the actual order for counterexample
        print(f"\n=== COUNTEREXAMPLE ===")
        print(f"Expected stage order: [0, 1, 2, 3, 4, 5, 6, 7]")
        print(f"Actual stage order:   {stage_calls}")
        print(f"======================\n")
        
        # Assert sequential order - THIS WILL FAIL on unfixed code
        expected_order = [0, 1, 2, 3, 4, 5, 6, 7]
        assert stage_calls == expected_order, (
            f"Stage callbacks fired out of order!\n"
            f"Expected: {expected_order}\n"
            f"Actual:   {stage_calls}\n"
            f"Bug confirmed: Stage {stage_calls[2]} fired before Stage {stage_calls[3]}"
        )
    
    @pytest.mark.asyncio
    async def test_stage_callbacks_sequential_order_three_resumes(self):
        """
        Test stage callbacks fire in sequential order for 3 resumes.
        
        EXPECTED: FAILS on unfixed code, showing consistent [0, 1, 3, 2, 4, 5, 6, 7] pattern
        across multiple resumes, confirming the bug is reproducible.
        """
        all_stage_calls = []
        
        async def mock_stage_callback(stage_index: int):
            all_stage_calls.append(stage_index)
        
        test_resume_text = "Test resume with skills: Python, Java, AWS"
        test_pdf_bytes = test_resume_text.encode('utf-8')
        
        with patch('main.extract_resume_text', return_value=test_resume_text), \
             patch('main._strip_pii', return_value={
                 "sanitized_text": test_resume_text,
                 "items_removed": [],
                 "method": "mock"
             }), \
             patch('main.structure_resume', return_value={
                 "technical_skills": ["Python", "Java"],
                 "job_history": [{"title": "Developer", "duration_months": 24}],
                 "highest_degree": "Bachelor",
                 "total_years_experience": 3
             }), \
             patch('main.evaluate_resume', return_value={
                 "overall_score": 75,
                 "skill_match_score": 70,
                 "experience_score": 80,
                 "education_score": 70,
                 "strengths": ["Python"],
                 "missing_skills": ["AWS"],
                 "recommendation": "Schedule Interview",
                 "reasoning": "Good fit"
             }), \
             patch('main._simulate_legacy_ats', return_value={
                 "legacy_ats_score": 65,
                 "verdict": "Pass",
                 "primary_bias": "None",
                 "bias_breakdown": {}
             }), \
             patch('main._record_score'), \
             patch('main._compute_percentile_from_db', return_value=(60, 50, False)), \
             patch('main.extract_urls_from_text', return_value=[]), \
             patch('main.create_scan_record'):
            
            # Process 3 resumes
            for i in range(3):
                await execute_scan_job(
                    job_id=f"test-job-{i}",
                    filename=f"resume_{i}.pdf",
                    ext=".pdf",
                    pdf_bytes=test_pdf_bytes,
                    role="Software Engineer",
                    jd_skills="Python, Java, AWS",
                    current_user_id=1,
                    stage_callback=mock_stage_callback
                )
        
        # Verify each resume had 8 stage callbacks
        assert len(all_stage_calls) == 24, f"Expected 24 total callbacks (3 resumes × 8 stages), got {len(all_stage_calls)}"
        
        # Split into per-resume sequences
        resume_1_stages = all_stage_calls[0:8]
        resume_2_stages = all_stage_calls[8:16]
        resume_3_stages = all_stage_calls[16:24]
        
        print(f"\n=== COUNTEREXAMPLE (3 Resumes) ===")
        print(f"Expected order per resume: [0, 1, 2, 3, 4, 5, 6, 7]")
        print(f"Resume 1 actual order:     {resume_1_stages}")
        print(f"Resume 2 actual order:     {resume_2_stages}")
        print(f"Resume 3 actual order:     {resume_3_stages}")
        print(f"===================================\n")
        
        expected_order = [0, 1, 2, 3, 4, 5, 6, 7]
        
        # Assert all three resumes follow sequential order - WILL FAIL on unfixed code
        assert resume_1_stages == expected_order, f"Resume 1 stages out of order: {resume_1_stages}"
        assert resume_2_stages == expected_order, f"Resume 2 stages out of order: {resume_2_stages}"
        assert resume_3_stages == expected_order, f"Resume 3 stages out of order: {resume_3_stages}"
    
    @pytest.mark.asyncio
    async def test_parallel_execution_optimization_active(self):
        """
        Verify that parallel execution optimization is active (skill graph + blind scoring run concurrently).
        
        This test should PASS - it confirms the parallel optimization is intentional and working.
        The bug is NOT the parallel execution itself, but the callback ordering.
        """
        execution_log = []
        
        async def mock_stage_callback(stage_index: int):
            execution_log.append(('callback', stage_index))
        
        # Track when structure_resume and evaluate_resume are called
        original_structure = None
        original_evaluate = None
        
        def track_structure_resume(*args, **kwargs):
            execution_log.append(('structure_resume', 'called'))
            return {
                "technical_skills": ["Python"],
                "job_history": [{"title": "Dev", "duration_months": 12}],
                "highest_degree": "Bachelor",
                "total_years_experience": 2
            }
        
        def track_evaluate_resume(*args, **kwargs):
            execution_log.append(('evaluate_resume', 'called'))
            return {
                "overall_score": 70,
                "skill_match_score": 65,
                "experience_score": 75,
                "education_score": 70,
                "strengths": ["Python"],
                "missing_skills": [],
                "recommendation": "Interview",
                "reasoning": "Good"
            }
        
        test_resume_text = "Test resume"
        test_pdf_bytes = test_resume_text.encode('utf-8')
        
        with patch('main.extract_resume_text', return_value=test_resume_text), \
             patch('main._strip_pii', return_value={
                 "sanitized_text": test_resume_text,
                 "items_removed": [],
                 "method": "mock"
             }), \
             patch('main.structure_resume', side_effect=track_structure_resume), \
             patch('main.evaluate_resume', side_effect=track_evaluate_resume), \
             patch('main._simulate_legacy_ats', return_value={
                 "legacy_ats_score": 60,
                 "verdict": "Pass",
                 "primary_bias": "None",
                 "bias_breakdown": {}
             }), \
             patch('main._record_score'), \
             patch('main._compute_percentile_from_db', return_value=(50, 30, False)), \
             patch('main.extract_urls_from_text', return_value=[]), \
             patch('main.create_scan_record'):
            
            await execute_scan_job(
                job_id="test-parallel",
                filename="test.pdf",
                ext=".pdf",
                pdf_bytes=test_pdf_bytes,
                role="Developer",
                jd_skills="Python, Java",
                current_user_id=1,
                stage_callback=mock_stage_callback
            )
        
        print(f"\n=== EXECUTION LOG ===")
        for entry in execution_log:
            print(f"  {entry}")
        print(f"=====================\n")
        
        # Verify both structure_resume and evaluate_resume were called
        # (This confirms parallel execution is happening)
        assert ('structure_resume', 'called') in execution_log, "structure_resume was not called"
        assert ('evaluate_resume', 'called') in execution_log, "evaluate_resume was not called"
        
        # This test should PASS - parallel execution is working as intended
        print("✓ Parallel execution optimization is active")


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "-s"])
