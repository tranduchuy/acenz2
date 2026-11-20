import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Baseline schema exported from the existing database (structure only, no data):
 * 38 tables, 1 view, all constraints and indexes.
 * The TypeORM `migrations` table is not included; TypeORM creates it itself.
 */
export class InitialSchema1795162377401 implements MigrationInterface {
  name = "InitialSchema1795162377401";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- Dumped from database version 18.7
-- Dumped by pg_dump version 18.7

--
-- Name: article_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_categories (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    name text,
    slug text,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: article_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.article_categories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.article_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    category_id bigint NOT NULL,
    author_id bigint NOT NULL,
    title text,
    slug text,
    summary text,
    body text,
    cover_image_url text,
    tags text,
    template smallint,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.articles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.articles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    parent_id bigint,
    name text NOT NULL,
    slug text,
    seo_keywords text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: chat_conversation_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversation_members (
    conversation_id bigint NOT NULL,
    user_id bigint NOT NULL
);

--
-- Name: chat_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversations (
    id bigint NOT NULL,
    legacy_mongo_id character(24)
);

--
-- Name: chat_conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.chat_conversations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.chat_conversations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: chat_message_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_message_recipients (
    message_id bigint NOT NULL,
    user_id bigint NOT NULL,
    is_read boolean DEFAULT false NOT NULL
);

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    conversation_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    body text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.chat_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: class_enrollment_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_enrollment_levels (
    enrollment_id bigint NOT NULL,
    class_level_id bigint NOT NULL
);

--
-- Name: class_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_enrollments (
    id bigint NOT NULL,
    class_id bigint NOT NULL,
    student_id bigint NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    rating numeric(4,2),
    review text,
    facebook_share_count integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT class_enrollments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text])))
);

--
-- Name: class_enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.class_enrollments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.class_enrollments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: class_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_levels (
    id bigint NOT NULL,
    class_id bigint NOT NULL,
    legacy_index integer,
    name text NOT NULL,
    duration integer,
    starts_on date,
    ends_on date,
    is_current boolean DEFAULT false NOT NULL
);

--
-- Name: class_levels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.class_levels ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.class_levels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: class_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_posts (
    id bigint NOT NULL,
    class_id bigint NOT NULL,
    parent_id bigint,
    author_id bigint NOT NULL,
    post_type smallint,
    url text,
    body text,
    legacy_index integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: class_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.class_posts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.class_posts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: class_teacher_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_teacher_levels (
    class_id bigint NOT NULL,
    user_id bigint NOT NULL,
    class_level_id bigint NOT NULL
);

--
-- Name: class_teachers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_teachers (
    class_id bigint NOT NULL,
    user_id bigint NOT NULL,
    is_main boolean DEFAULT false NOT NULL,
    skill text
);

--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    course_id bigint NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    slug text,
    schedule text,
    location_address text,
    location_district text,
    location_province text,
    starts_on date,
    ends_on date,
    capacity integer,
    duration integer,
    rating numeric(4,2),
    facebook_share_count integer,
    is_open boolean DEFAULT false NOT NULL,
    is_share_window_open boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    legacy_seat_count integer,
    CONSTRAINT classes_status_check CHECK ((status = ANY (ARRAY['active'::text, 'closed'::text])))
);

--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.classes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.classes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id bigint NOT NULL,
    author_id bigint,
    parent_id bigint,
    exercise_id bigint,
    submission_id bigint,
    submission_answer_id bigint,
    article_id bigint,
    body text,
    legacy_index integer,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT comments_exactly_one_target CHECK ((num_nonnulls(exercise_id, submission_id, submission_answer_id, article_id) = 1))
);

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.comments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: course_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_requests (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    teacher_id bigint NOT NULL,
    category_id bigint NOT NULL,
    title text NOT NULL,
    slug text,
    content text,
    image_url text,
    duration_text text,
    price_text text,
    start_date_text text,
    location_address text,
    location_district text,
    location_city text,
    status text DEFAULT 'pending'::text NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'resolved'::text])))
);

--
-- Name: course_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.course_requests ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.course_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: course_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_reviews (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    parent_id bigint,
    user_id bigint,
    author_name text,
    body text,
    is_happy boolean,
    legacy_index integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: course_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.course_reviews ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.course_reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: course_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_students (
    course_id bigint NOT NULL,
    student_id bigint NOT NULL
);

--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    category_id bigint NOT NULL,
    main_teacher_id bigint NOT NULL,
    name text NOT NULL,
    slug text,
    content text,
    image_url text,
    priority integer,
    is_locked boolean DEFAULT false NOT NULL,
    homepage_show boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.courses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.courses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    province_id bigint NOT NULL,
    name text NOT NULL,
    slug text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.districts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.districts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: exercise_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_attachments (
    id bigint NOT NULL,
    exercise_id bigint NOT NULL,
    kind text NOT NULL,
    "position" integer,
    url text,
    alt_url text,
    external_id text,
    CONSTRAINT exercise_attachments_kind_check CHECK ((kind = ANY (ARRAY['file'::text, 'audio'::text])))
);

--
-- Name: exercise_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.exercise_attachments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exercise_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: exercise_item_choices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_item_choices (
    id bigint NOT NULL,
    item_id bigint NOT NULL,
    "position" integer,
    content text,
    is_correct boolean DEFAULT false NOT NULL
);

--
-- Name: exercise_item_choices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.exercise_item_choices ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exercise_item_choices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: exercise_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_items (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    exercise_id bigint NOT NULL,
    parent_id bigint,
    section text,
    "position" integer,
    label text,
    prompt text,
    correct_answer text,
    max_score numeric,
    note text,
    item_type smallint,
    legacy_index integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exercise_items_section_check CHECK ((section = ANY (ARRAY['listening'::text, 'reading'::text])))
);

--
-- Name: exercise_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.exercise_items ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exercise_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: exercise_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_shares (
    exercise_id bigint NOT NULL,
    teacher_id bigint NOT NULL
);

--
-- Name: exercises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercises (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    legacy_source text,
    kind text NOT NULL,
    class_id bigint,
    is_library boolean DEFAULT false NOT NULL,
    class_level_id bigint,
    teacher_id bigint,
    main_teacher_id bigint,
    title text,
    description text,
    body text,
    writing_prompt text,
    assignment_type text,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    time_limit_minutes integer,
    question_count integer,
    max_score numeric,
    status text DEFAULT 'open'::text NOT NULL,
    is_draft boolean DEFAULT false NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    answer_reveal_mode text,
    show_correct_answers boolean,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exercises_answer_reveal_mode_check CHECK ((answer_reveal_mode = ANY (ARRAY['all_submitted'::text, 'after_comment'::text, 'immediately'::text, 'never'::text]))),
    CONSTRAINT exercises_answer_reveal_mode_marktool_only CHECK (((answer_reveal_mode IS NULL) OR (kind = 'marktool'::text))),
    CONSTRAINT exercises_body_essay_only CHECK (((body IS NULL) OR (kind = 'essay'::text))),
    CONSTRAINT exercises_draft_has_no_class CHECK (((NOT is_draft) OR (class_id IS NULL))),
    CONSTRAINT exercises_draft_or_library CHECK ((NOT (is_draft AND is_library))),
    CONSTRAINT exercises_kind_check CHECK ((kind = ANY (ARRAY['essay'::text, 'marktool'::text, 'marktool_v1'::text, 'toeic'::text, 'toeic_test'::text, 'ielts'::text, 'quiz'::text]))),
    CONSTRAINT exercises_legacy_source_check CHECK ((legacy_source = ANY (ARRAY['assignment'::text, 'beta_marktools'::text, 'marktools'::text, 'toiec-tools'::text, 'ielts-test'::text, 'quizzes'::text]))),
    CONSTRAINT exercises_show_correct_answers_marktool_only CHECK (((show_correct_answers IS NULL) OR (kind = 'marktool'::text))),
    CONSTRAINT exercises_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text]))),
    CONSTRAINT exercises_writing_prompt_ielts_only CHECK (((writing_prompt IS NULL) OR (kind = 'ielts'::text)))
);

--
-- Name: exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.exercises ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exercises_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: impersonation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.impersonation_logs (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    admin_id bigint NOT NULL,
    user_id bigint NOT NULL,
    started_at timestamp with time zone NOT NULL,
    ended_at timestamp with time zone,
    ip inet,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: impersonation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.impersonation_logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.impersonation_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    exercise_id bigint NOT NULL,
    student_id bigint NOT NULL,
    attempt_no smallint NOT NULL,
    legacy_index integer,
    submitted_at timestamp with time zone,
    score numeric,
    max_score numeric,
    status text DEFAULT 'submitted'::text NOT NULL,
    is_late boolean DEFAULT false NOT NULL,
    content text,
    corrected_content text,
    duration_seconds integer,
    student_notified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT submissions_attempt_no_positive CHECK ((attempt_no >= 1)),
    CONSTRAINT submissions_status_check CHECK ((status = ANY (ARRAY['submitted'::text, 'graded'::text])))
);

--
-- Name: latest_submissions; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.latest_submissions AS
 SELECT DISTINCT ON (exercise_id, student_id) id,
    legacy_mongo_id,
    exercise_id,
    student_id,
    attempt_no,
    legacy_index,
    submitted_at,
    score,
    max_score,
    status,
    is_late,
    content,
    corrected_content,
    duration_seconds,
    student_notified,
    created_at,
    updated_at
   FROM public.submissions
  ORDER BY exercise_id, student_id, attempt_no DESC;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    legacy_source text,
    legacy_index integer,
    recipient_id bigint NOT NULL,
    sender_id bigint,
    from_user_id bigint,
    type smallint,
    target_kind text,
    target_id bigint,
    content text,
    url text,
    is_read boolean DEFAULT false NOT NULL,
    is_opened boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_legacy_source_check CHECK ((legacy_source = ANY (ARRAY['notifies'::text, 'users.notification'::text]))),
    CONSTRAINT notifications_target_kind_check CHECK ((target_kind = ANY (ARRAY['exercise'::text, 'class'::text])))
);

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: provinces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provinces (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    name text NOT NULL,
    slug text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: provinces_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.provinces ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.provinces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotations (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    author text,
    author_url text,
    content text,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quotations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.quotations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: submission_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submission_answers (
    id bigint NOT NULL,
    submission_id bigint NOT NULL,
    item_id bigint NOT NULL,
    answer text,
    is_correct boolean,
    score numeric,
    legacy_index integer
);

--
-- Name: submission_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.submission_answers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.submission_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: submission_section_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submission_section_scores (
    submission_id bigint NOT NULL,
    section text NOT NULL,
    correct_count integer,
    score numeric,
    CONSTRAINT submission_section_scores_section_check CHECK ((section = ANY (ARRAY['listening'::text, 'reading'::text, 'writing'::text])))
);

--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.submissions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: teacher_assignment_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_assignment_types (
    id bigint NOT NULL,
    legacy_setting_mongo_id character(24),
    teacher_id bigint NOT NULL,
    family text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT teacher_assignment_types_family_check CHECK ((family = ANY (ARRAY['essay'::text, 'multiple'::text, 'toeic'::text])))
);

--
-- Name: teacher_assignment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.teacher_assignment_types ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.teacher_assignment_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: teacher_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_profiles (
    user_id bigint NOT NULL,
    is_confirmed boolean DEFAULT false NOT NULL,
    teaching_address text
);

--
-- Name: teacher_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_students (
    teacher_id bigint NOT NULL,
    student_id bigint NOT NULL
);

--
-- Name: user_merges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_merges (
    id bigint NOT NULL,
    merged_legacy_mongo_id character(24) NOT NULL,
    into_user_id bigint NOT NULL,
    reason text,
    merged_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: user_merges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_merges ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_merges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    legacy_mongo_id character(24),
    email text,
    password_hash text,
    role text NOT NULL,
    first_name text,
    middle_name text,
    last_name text,
    gender text,
    birthday date,
    phone text,
    address text,
    picture_url text,
    description text,
    major text,
    slug text,
    ssn text,
    ssn_image_url text,
    fb_id text,
    fb_token text,
    login_token text,
    register_token text,
    is_confirmed boolean DEFAULT false NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    must_change_password boolean DEFAULT false NOT NULL,
    homepage_show boolean DEFAULT false NOT NULL,
    teacher_request boolean DEFAULT false NOT NULL,
    rating numeric(4,2),
    rating_count integer,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['teacher'::text, 'student'::text, 'admin'::text, 'moderator'::text])))
);

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: article_categories article_categories_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_categories
    ADD CONSTRAINT article_categories_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: article_categories article_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_categories
    ADD CONSTRAINT article_categories_pkey PRIMARY KEY (id);

--
-- Name: article_categories article_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_categories
    ADD CONSTRAINT article_categories_slug_key UNIQUE (slug);

--
-- Name: articles articles_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);

--
-- Name: articles articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);

--
-- Name: categories categories_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);

--
-- Name: chat_conversation_members chat_conversation_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_members
    ADD CONSTRAINT chat_conversation_members_pkey PRIMARY KEY (conversation_id, user_id);

--
-- Name: chat_conversations chat_conversations_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);

--
-- Name: chat_message_recipients chat_message_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_recipients
    ADD CONSTRAINT chat_message_recipients_pkey PRIMARY KEY (message_id, user_id);

--
-- Name: chat_messages chat_messages_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);

--
-- Name: class_enrollment_levels class_enrollment_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_enrollment_levels
    ADD CONSTRAINT class_enrollment_levels_pkey PRIMARY KEY (enrollment_id, class_level_id);

--
-- Name: class_enrollments class_enrollments_class_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_enrollments
    ADD CONSTRAINT class_enrollments_class_id_student_id_key UNIQUE (class_id, student_id);

--
-- Name: class_enrollments class_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_enrollments
    ADD CONSTRAINT class_enrollments_pkey PRIMARY KEY (id);

--
-- Name: class_levels class_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_levels
    ADD CONSTRAINT class_levels_pkey PRIMARY KEY (id);

--
-- Name: class_posts class_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_posts
    ADD CONSTRAINT class_posts_pkey PRIMARY KEY (id);

--
-- Name: class_teacher_levels class_teacher_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_teacher_levels
    ADD CONSTRAINT class_teacher_levels_pkey PRIMARY KEY (class_id, user_id, class_level_id);

--
-- Name: class_teachers class_teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_teachers
    ADD CONSTRAINT class_teachers_pkey PRIMARY KEY (class_id, user_id);

--
-- Name: classes classes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_code_key UNIQUE (code);

--
-- Name: classes classes_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);

--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);

--
-- Name: course_requests course_requests_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_requests
    ADD CONSTRAINT course_requests_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: course_requests course_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_requests
    ADD CONSTRAINT course_requests_pkey PRIMARY KEY (id);

--
-- Name: course_reviews course_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_pkey PRIMARY KEY (id);

--
-- Name: course_students course_students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_students
    ADD CONSTRAINT course_students_pkey PRIMARY KEY (course_id, student_id);

--
-- Name: courses courses_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);

--
-- Name: courses courses_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_slug_key UNIQUE (slug);

--
-- Name: districts districts_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);

--
-- Name: exercise_attachments exercise_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_attachments
    ADD CONSTRAINT exercise_attachments_pkey PRIMARY KEY (id);

--
-- Name: exercise_item_choices exercise_item_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_item_choices
    ADD CONSTRAINT exercise_item_choices_pkey PRIMARY KEY (id);

--
-- Name: exercise_items exercise_items_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_items
    ADD CONSTRAINT exercise_items_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: exercise_items exercise_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_items
    ADD CONSTRAINT exercise_items_pkey PRIMARY KEY (id);

--
-- Name: exercise_shares exercise_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_shares
    ADD CONSTRAINT exercise_shares_pkey PRIMARY KEY (exercise_id, teacher_id);

--
-- Name: exercises exercises_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);

--
-- Name: impersonation_logs impersonation_logs_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impersonation_logs
    ADD CONSTRAINT impersonation_logs_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: impersonation_logs impersonation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impersonation_logs
    ADD CONSTRAINT impersonation_logs_pkey PRIMARY KEY (id);

--
-- Name: notifications notifications_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

--
-- Name: provinces provinces_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);

--
-- Name: provinces provinces_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_slug_key UNIQUE (slug);

--
-- Name: quotations quotations_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);

--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);

--
-- Name: submission_answers submission_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_answers
    ADD CONSTRAINT submission_answers_pkey PRIMARY KEY (id);

--
-- Name: submission_section_scores submission_section_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_section_scores
    ADD CONSTRAINT submission_section_scores_pkey PRIMARY KEY (submission_id, section);

--
-- Name: submissions submissions_exercise_id_student_id_attempt_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_exercise_id_student_id_attempt_no_key UNIQUE (exercise_id, student_id, attempt_no);

--
-- Name: submissions submissions_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);

--
-- Name: teacher_assignment_types teacher_assignment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignment_types
    ADD CONSTRAINT teacher_assignment_types_pkey PRIMARY KEY (id);

--
-- Name: teacher_profiles teacher_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_pkey PRIMARY KEY (user_id);

--
-- Name: teacher_students teacher_students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_students
    ADD CONSTRAINT teacher_students_pkey PRIMARY KEY (teacher_id, student_id);

--
-- Name: user_merges user_merges_merged_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_merges
    ADD CONSTRAINT user_merges_merged_legacy_mongo_id_key UNIQUE (merged_legacy_mongo_id);

--
-- Name: user_merges user_merges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_merges
    ADD CONSTRAINT user_merges_pkey PRIMARY KEY (id);

--
-- Name: users users_legacy_mongo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_legacy_mongo_id_key UNIQUE (legacy_mongo_id);

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Name: articles_author_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_author_id_idx ON public.articles USING btree (author_id);

--
-- Name: articles_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_category_id_idx ON public.articles USING btree (category_id);

--
-- Name: categories_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_parent_id_idx ON public.categories USING btree (parent_id);

--
-- Name: chat_conversation_members_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_conversation_members_user_id_idx ON public.chat_conversation_members USING btree (user_id);

--
-- Name: chat_message_recipients_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_message_recipients_user_id_idx ON public.chat_message_recipients USING btree (user_id);

--
-- Name: chat_messages_conversation_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_messages_conversation_id_idx ON public.chat_messages USING btree (conversation_id);

--
-- Name: chat_messages_sender_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_messages_sender_id_idx ON public.chat_messages USING btree (sender_id);

--
-- Name: class_enrollment_levels_class_level_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX class_enrollment_levels_class_level_id_idx ON public.class_enrollment_levels USING btree (class_level_id);

--
-- Name: class_enrollments_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX class_enrollments_student_id_idx ON public.class_enrollments USING btree (student_id);

--
-- Name: class_levels_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX class_levels_class_id_idx ON public.class_levels USING btree (class_id);

--
-- Name: class_posts_author_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX class_posts_author_id_idx ON public.class_posts USING btree (author_id);

--
-- Name: class_posts_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX class_posts_class_id_idx ON public.class_posts USING btree (class_id);

--
-- Name: class_posts_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX class_posts_parent_id_idx ON public.class_posts USING btree (parent_id);

--
-- Name: class_teacher_levels_class_level_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX class_teacher_levels_class_level_id_idx ON public.class_teacher_levels USING btree (class_level_id);

--
-- Name: class_teachers_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX class_teachers_user_id_idx ON public.class_teachers USING btree (user_id);

--
-- Name: classes_course_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX classes_course_id_idx ON public.classes USING btree (course_id);

--
-- Name: comments_article_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_article_id_idx ON public.comments USING btree (article_id);

--
-- Name: comments_author_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_author_id_idx ON public.comments USING btree (author_id);

--
-- Name: comments_exercise_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_exercise_id_idx ON public.comments USING btree (exercise_id);

--
-- Name: comments_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_parent_id_idx ON public.comments USING btree (parent_id);

--
-- Name: comments_submission_answer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_submission_answer_id_idx ON public.comments USING btree (submission_answer_id);

--
-- Name: comments_submission_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_submission_id_idx ON public.comments USING btree (submission_id);

--
-- Name: course_requests_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_requests_category_id_idx ON public.course_requests USING btree (category_id);

--
-- Name: course_requests_teacher_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_requests_teacher_id_idx ON public.course_requests USING btree (teacher_id);

--
-- Name: course_reviews_course_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_reviews_course_id_idx ON public.course_reviews USING btree (course_id);

--
-- Name: course_reviews_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_reviews_parent_id_idx ON public.course_reviews USING btree (parent_id);

--
-- Name: course_reviews_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_reviews_user_id_idx ON public.course_reviews USING btree (user_id);

--
-- Name: course_students_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_students_student_id_idx ON public.course_students USING btree (student_id);

--
-- Name: courses_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_category_id_idx ON public.courses USING btree (category_id);

--
-- Name: courses_main_teacher_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_main_teacher_id_idx ON public.courses USING btree (main_teacher_id);

--
-- Name: districts_province_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX districts_province_id_idx ON public.districts USING btree (province_id);

--
-- Name: exercise_attachments_exercise_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercise_attachments_exercise_id_idx ON public.exercise_attachments USING btree (exercise_id);

--
-- Name: exercise_item_choices_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercise_item_choices_item_id_idx ON public.exercise_item_choices USING btree (item_id);

--
-- Name: exercise_items_exercise_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercise_items_exercise_id_idx ON public.exercise_items USING btree (exercise_id);

--
-- Name: exercise_items_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercise_items_parent_id_idx ON public.exercise_items USING btree (parent_id);

--
-- Name: exercise_shares_teacher_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercise_shares_teacher_id_idx ON public.exercise_shares USING btree (teacher_id);

--
-- Name: exercises_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_class_id_idx ON public.exercises USING btree (class_id);

--
-- Name: exercises_class_level_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_class_level_id_idx ON public.exercises USING btree (class_level_id);

--
-- Name: exercises_main_teacher_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_main_teacher_id_idx ON public.exercises USING btree (main_teacher_id);

--
-- Name: exercises_teacher_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_teacher_id_idx ON public.exercises USING btree (teacher_id);

--
-- Name: impersonation_logs_admin_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX impersonation_logs_admin_id_idx ON public.impersonation_logs USING btree (admin_id);

--
-- Name: impersonation_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX impersonation_logs_user_id_idx ON public.impersonation_logs USING btree (user_id);

--
-- Name: notifications_from_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_from_user_id_idx ON public.notifications USING btree (from_user_id);

--
-- Name: notifications_recipient_read_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_recipient_read_created_idx ON public.notifications USING btree (recipient_id, is_read, created_at DESC);

--
-- Name: notifications_sender_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_sender_id_idx ON public.notifications USING btree (sender_id);

--
-- Name: submission_answers_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX submission_answers_item_id_idx ON public.submission_answers USING btree (item_id);

--
-- Name: submission_answers_submission_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX submission_answers_submission_id_idx ON public.submission_answers USING btree (submission_id);

--
-- Name: submissions_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX submissions_student_id_idx ON public.submissions USING btree (student_id);

--
-- Name: teacher_assignment_types_legacy_setting_mongo_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_assignment_types_legacy_setting_mongo_id_idx ON public.teacher_assignment_types USING btree (legacy_setting_mongo_id);

--
-- Name: teacher_assignment_types_teacher_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_assignment_types_teacher_id_idx ON public.teacher_assignment_types USING btree (teacher_id);

--
-- Name: teacher_students_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_students_student_id_idx ON public.teacher_students USING btree (student_id);

--
-- Name: user_merges_into_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_merges_into_user_id_idx ON public.user_merges USING btree (into_user_id);

--
-- Name: users_email_lower_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_lower_key ON public.users USING btree (lower(email)) WHERE (email IS NOT NULL);

--
-- Name: users_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_slug_key ON public.users USING btree (slug) WHERE (slug IS NOT NULL);

--
-- Name: articles articles_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: articles articles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.article_categories(id) ON DELETE RESTRICT;

--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

--
-- Name: chat_conversation_members chat_conversation_members_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_members
    ADD CONSTRAINT chat_conversation_members_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;

--
-- Name: chat_conversation_members chat_conversation_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_members
    ADD CONSTRAINT chat_conversation_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: chat_message_recipients chat_message_recipients_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_recipients
    ADD CONSTRAINT chat_message_recipients_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;

--
-- Name: chat_message_recipients chat_message_recipients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message_recipients
    ADD CONSTRAINT chat_message_recipients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: chat_messages chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;

--
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: class_enrollment_levels class_enrollment_levels_class_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_enrollment_levels
    ADD CONSTRAINT class_enrollment_levels_class_level_id_fkey FOREIGN KEY (class_level_id) REFERENCES public.class_levels(id) ON DELETE CASCADE;

--
-- Name: class_enrollment_levels class_enrollment_levels_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_enrollment_levels
    ADD CONSTRAINT class_enrollment_levels_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.class_enrollments(id) ON DELETE CASCADE;

--
-- Name: class_enrollments class_enrollments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_enrollments
    ADD CONSTRAINT class_enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

--
-- Name: class_enrollments class_enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_enrollments
    ADD CONSTRAINT class_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: class_levels class_levels_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_levels
    ADD CONSTRAINT class_levels_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

--
-- Name: class_posts class_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_posts
    ADD CONSTRAINT class_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: class_posts class_posts_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_posts
    ADD CONSTRAINT class_posts_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

--
-- Name: class_posts class_posts_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_posts
    ADD CONSTRAINT class_posts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.class_posts(id) ON DELETE CASCADE;

--
-- Name: class_teacher_levels class_teacher_levels_class_id_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_teacher_levels
    ADD CONSTRAINT class_teacher_levels_class_id_user_id_fkey FOREIGN KEY (class_id, user_id) REFERENCES public.class_teachers(class_id, user_id) ON DELETE CASCADE;

--
-- Name: class_teacher_levels class_teacher_levels_class_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_teacher_levels
    ADD CONSTRAINT class_teacher_levels_class_level_id_fkey FOREIGN KEY (class_level_id) REFERENCES public.class_levels(id) ON DELETE CASCADE;

--
-- Name: class_teachers class_teachers_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_teachers
    ADD CONSTRAINT class_teachers_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

--
-- Name: class_teachers class_teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_teachers
    ADD CONSTRAINT class_teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: classes classes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE RESTRICT;

--
-- Name: comments comments_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;

--
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

--
-- Name: comments comments_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;

--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;

--
-- Name: comments comments_submission_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_submission_answer_id_fkey FOREIGN KEY (submission_answer_id) REFERENCES public.submission_answers(id) ON DELETE CASCADE;

--
-- Name: comments comments_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;

--
-- Name: course_requests course_requests_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_requests
    ADD CONSTRAINT course_requests_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

--
-- Name: course_requests course_requests_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_requests
    ADD CONSTRAINT course_requests_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: course_reviews course_reviews_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

--
-- Name: course_reviews course_reviews_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.course_reviews(id) ON DELETE CASCADE;

--
-- Name: course_reviews course_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: course_students course_students_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_students
    ADD CONSTRAINT course_students_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

--
-- Name: course_students course_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_students
    ADD CONSTRAINT course_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: courses courses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

--
-- Name: courses courses_main_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_main_teacher_id_fkey FOREIGN KEY (main_teacher_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: districts districts_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id) ON DELETE RESTRICT;

--
-- Name: exercise_attachments exercise_attachments_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_attachments
    ADD CONSTRAINT exercise_attachments_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;

--
-- Name: exercise_item_choices exercise_item_choices_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_item_choices
    ADD CONSTRAINT exercise_item_choices_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.exercise_items(id) ON DELETE CASCADE;

--
-- Name: exercise_items exercise_items_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_items
    ADD CONSTRAINT exercise_items_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;

--
-- Name: exercise_items exercise_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_items
    ADD CONSTRAINT exercise_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.exercise_items(id) ON DELETE CASCADE;

--
-- Name: exercise_shares exercise_shares_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_shares
    ADD CONSTRAINT exercise_shares_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;

--
-- Name: exercise_shares exercise_shares_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_shares
    ADD CONSTRAINT exercise_shares_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: exercises exercises_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE RESTRICT;

--
-- Name: exercises exercises_class_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_class_level_id_fkey FOREIGN KEY (class_level_id) REFERENCES public.class_levels(id) ON DELETE SET NULL;

--
-- Name: exercises exercises_main_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_main_teacher_id_fkey FOREIGN KEY (main_teacher_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: exercises exercises_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: impersonation_logs impersonation_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impersonation_logs
    ADD CONSTRAINT impersonation_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: impersonation_logs impersonation_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impersonation_logs
    ADD CONSTRAINT impersonation_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: notifications notifications_from_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: submission_answers submission_answers_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_answers
    ADD CONSTRAINT submission_answers_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.exercise_items(id) ON DELETE CASCADE;

--
-- Name: submission_answers submission_answers_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_answers
    ADD CONSTRAINT submission_answers_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;

--
-- Name: submission_section_scores submission_section_scores_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_section_scores
    ADD CONSTRAINT submission_section_scores_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;

--
-- Name: submissions submissions_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;

--
-- Name: submissions submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: teacher_assignment_types teacher_assignment_types_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignment_types
    ADD CONSTRAINT teacher_assignment_types_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: teacher_profiles teacher_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

--
-- Name: teacher_students teacher_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_students
    ADD CONSTRAINT teacher_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: teacher_students teacher_students_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_students
    ADD CONSTRAINT teacher_students_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: user_merges user_merges_into_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_merges
    ADD CONSTRAINT user_merges_into_user_id_fkey FOREIGN KEY (into_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- PostgreSQL database dump complete
--
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS public.latest_submissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.user_merges CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.teacher_students CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.teacher_profiles CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.teacher_assignment_types CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.submission_section_scores CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.submission_answers CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.schema_migrations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.quotations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.provinces CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.notifications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.submissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.impersonation_logs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.exercises CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.exercise_shares CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.exercise_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.exercise_item_choices CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.exercise_attachments CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.districts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.courses CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.course_students CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.course_reviews CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.course_requests CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.comments CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.classes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.class_teachers CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.class_teacher_levels CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.class_posts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.class_levels CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.class_enrollments CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.class_enrollment_levels CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.chat_messages CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.chat_message_recipients CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.chat_conversations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.chat_conversation_members CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.articles CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.article_categories CASCADE`);
  }
}
